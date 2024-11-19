const { raw } = require('objection');

const Turn = require('../../../models/turns');
const Device = require('../../../models/device');
const Machine = require('../../../models/machine');
const Pairing = require('../../../models/pairing');
const StoreCustomer = require('../../../models/storeCustomer');
const MachinePaymentType = require('../../../models/machinePaymentType');
const Store = require('../../../models/store');
const { getOrderCount, updateOrderCount } = require('../../../utils/ordersCounter');

class DeviceUtils {
    static async findDevice(name, transaction) {
        const device = await Device.query(transaction)
            .whereRaw('lower(name) = ?', [name.toLowerCase()])
            .first();
        return device;
    }

    static async updateDevice(id, payload, transaction) {
        const device = await Device.query(transaction).patch(payload).findById(id).returning('*');
        return device;
    }

    static async getDeviceAndMachineDetails(device, transaction) {
        const machine =
            (await Machine.query(transaction)
                .select(
                    'machines.id as machineId',
                    'machineTurnsStats.avgTurnsPerDay',
                    'machineTypes.name as machineType',
                    'machineTurnsStats.avgSelfServeRevenuePerDay',
                )
                .innerJoin('pairing', (context) => {
                    context
                        .on('machines.id', '=', 'pairing.machineId')
                        .andOnNull('pairing.deletedAt');
                })
                .innerJoin('machineModels', 'machineModels.id', 'machines.modelId')
                .innerJoin('machineTypes', 'machineTypes.id', 'machineModels.typeId')
                .leftJoin('machineTurnsStats', 'machineTurnsStats.machineId', 'machines.id')
                .where('pairing.deviceId', device.id)
                .first()) || {};
        return {
            deviceName: device.name,
            deviceId: device.id,
            machineId: machine.machineId || null,
            status: device.status,
            machineType: machine.machineType,
            avgTurnsPerDay: machine.avgTurnsPerDay || 0,
            avgRevenuePerDayInCents: machine.avgSelfServeRevenuePerDay || 0,
            error: device.error,
        };
    }

    static async getStore(deviceId, transaction) {
        const store =
            (await Device.query(transaction)
                .select('storeId')
                .join('batches', 'batches.id', 'devices.batchId')
                .where('devices.id', deviceId)
                .first()) || {};
        return store.storeId;
    }

    static async activeTurn({ machineId, transaction, deviceId }) {
        const turn =
            (await Turn.query(transaction)
                .select('id', 'serviceType', 'status')
                .findOne({
                    machineId,
                    deviceId,
                    completedAt: null,
                })
                .skipUndefined()) || {};
        return turn;
    }

    static async getInUseResponse({ device, transaction, turn }) {
        const deviceDetails = await this.getDeviceAndMachineDetails(device, transaction);
        const { machineId } = deviceDetails;
        // const activeTurn = machineId ? await this.activeTurn({ machineId, transaction }) : {};
        let activeTurn = turn;
        if (machineId && turn.id) {
            activeTurn = await this.activeTurn({ machineId, transaction });
        }
        return {
            ...deviceDetails,
            activeTurn,
        };
    }

    static async machineDetails({ device, transaction }) {
        const machine = await Machine.query(transaction)
            .select(
                'machines.id as machineId',
                'machines.storeId',
                'machineTypes.name as machineType',
                'machinePricing.price',
                'machines.turnTimeInMinutes',
                'stores.businessId',
            )
            .innerJoin('pairing', (context) => {
                context.on('machines.id', '=', 'pairing.machineId').andOnNull('pairing.deletedAt');
            })
            .innerJoin('machineModels', 'machineModels.id', 'machines.modelId')
            .innerJoin('machineTypes', 'machineTypes.id', 'machineModels.typeId')
            .innerJoin('machinePricing', (context) => {
                context
                    .on('machinePricing.machineId', 'machines.id')
                    .andOnNull('machinePricing.deletedAt');
            })
            .innerJoin('stores', 'stores.id', 'machines.storeId')
            .where('pairing.deviceId', device.id)
            .first();
        return machine;
    }

    static async getMachinePaymentType({ type, transaction }) {
        const paymentType = await MachinePaymentType.query(transaction).findOne({
            type,
        });
        return paymentType;
    }

    static async updateMachineStats({ machine, paymentEnumerations = {}, transaction }) {
        let { totalPairedDays } =
            (await Pairing.query(transaction)
                .select(
                    raw(`
        (coalesce("deletedAt", (now() at time zone 'UTC' - INTERVAL '1 DAY'))::date - "createdAt"::date)
         as "totalPairedDays"
        `),
                )
                .where({
                    machineId: machine.machineId,
                })
                .first()) || {};
        totalPairedDays = totalPairedDays || 1;
        const {
            avgTurnsPerDay = 0,
            avgRevenuePerDayInCents = 0,
            avgSelfServeRevenuePerDayInCents = 0,
        } = machine;
        const totalTurns = avgTurnsPerDay * totalPairedDays;
        const totalRevenue = avgRevenuePerDayInCents * totalPairedDays;
        const totalSelfServeRevenue = avgSelfServeRevenuePerDayInCents * totalPairedDays;
        const { amount = 0 } = paymentEnumerations;
        const updatedMachine = await Machine.query(transaction)
            .patch({
                avgTurnsPerDay: Math.round((totalTurns + 1) / totalPairedDays),
                avgRevenuePerDayInCents: Math.round(
                    (totalRevenue + amount * 100) / totalPairedDays,
                ),
                avgSelfServeRevenuePerDayInCents: Math.round(
                    (totalSelfServeRevenue + amount * 100) / totalPairedDays,
                ),
            })
            .findById(machine.machineId)
            .returning('*')
            .first();
        return updatedMachine;
    }

    static async getTurnCode({ transaction, businessId }) {
        const code = await getOrderCount(businessId, transaction);
        await updateOrderCount(businessId, code, transaction);
        return { id: code || 0 };
    }

    static async findPreviousPayment({ device, transaction, paymentTime }) {
        let turn = await Turn.query(transaction)
            .select('turns.*')
            .join('machinePayments', 'machinePayments.turnId', 'turns.id')
            .whereRaw(
                `
            ('${paymentTime}')::timestamp  
            between ("machinePayments"."createdAt")  and (("machinePayments"."createdAt" + interval '5 minutes'))
            and "deviceId" = ${device.id} and status <> 'COMPLETED'
        `,
            )
            .first();
        if (!turn) {
            turn = await this.pendingPaymentTurn({ deviceId: device.id, transaction });
        }
        return turn || {};
    }

    static async pendingPaymentTurn({ deviceId, transaction }) {
        const turn = await Turn.query(transaction)
            .where({
                deviceId,
                paymentStatus: 'BALANCE_DUE',
            })
            .whereNot('status', 'COMPLETED')
            .orderBy('id', 'desc')
            .first();
        return turn || {};
    }

    static async findGuestCustomer({ storeId, transaction }) {
        const customer = await StoreCustomer.query(transaction).findOne({
            storeId,
            email: `guest_account_${storeId}@trycents.com`,
        });
        return customer || {};
    }

    static async getStoreDetails({ storeId, transaction }) {
        const result = await Store.query(transaction)
            .select('stores.*', 'storeSettings.*')
            .innerJoin('storeSettings', 'stores.id', 'storeSettings.storeId')
            .where('stores.id', storeId)
            .first();
        return result;
    }
}

module.exports = DeviceUtils;
