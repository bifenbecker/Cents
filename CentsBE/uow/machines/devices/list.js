const { raw } = require('objection');

const Device = require('../../../models/device');

function devicesListResponseFormatter(payload) {
    const { devicesList, limit, page } = payload;

    const devices = devicesList.map((device) => ({
        id: device.id,
        store: {
            id: device.storeId,
            address: device.storeAddress,
            name: device.storeName,
        },
        name: device.name,
    }));

    const response = {};
    response.devices = devices;
    response.hasMore = devicesList.length
        ? Number(devicesList[0].totalCount) > limit * page
        : false;
    return response;
}

exports.unPairedOnlineDeviceList = async (payload) => {
    try {
        const { storeIds, page, keyword, limit = 25, transaction } = payload;
        let availDeviceQuery = Device.query(transaction)
            .select(
                'devices.*',
                'stores.id as storeId',
                'stores.address as storeAddress',
                'stores.name as storeName',
                raw('count(devices.id) over() as "totalCount"'),
            )
            .leftJoin('batches', 'batches.id', 'devices.batchId')
            .leftJoin('stores', 'stores.id', 'batches.storeId')
            .where('devices.status', 'ONLINE')
            .whereIn('batches.storeId', storeIds)
            .where('isPaired', false);

        if (keyword) {
            // searching the keyword in devices name
            availDeviceQuery = availDeviceQuery.where('devices.name', 'ilike', `%${keyword}%`);
        }
        const devicesList = await availDeviceQuery
            .limit(limit)
            .offset((Number(page) - 1) * limit)
            .orderBy('devices.id', 'desc');

        return devicesListResponseFormatter({
            devicesList,
            limit,
            page: Number(page),
        });
    } catch (error) {
        throw new Error(error);
    }
};
