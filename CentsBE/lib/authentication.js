const jwt = require('jsonwebtoken');
const fs = require('fs');
const util = require('util');
const path = require('path');
const LaundromatBusiness = require('../models/laundromatBusiness');

// TODO add Type Validations.

const Device = require('../models/device');
const Pairing = require('../models/pairing');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const readFile = util.promisify(fs.readFile);

const verifyRequest = async (payload) => {
    try {
        const decoded = jwt.decode(payload);
        const { machineId } = decoded.payload;
        if (machineId) {
            const machine = await Pairing.query().findOne({
                machineId,
                isDeleted: false,
            });
            if (machine) {
                const device = await Device.query().findOne({ id: machine.deviceId });
                const check = jwt.verify(payload, device.privateKey /* pubkey */, {
                    algorithms: ['RS256'],
                });
                return check;
            }
            LoggerHandler('error', 'Invalid Key Error', payload);
            return false;
        }
        LoggerHandler('error', 'Invalid request', payload);
        return false;
    } catch (error) {
        throw new Error(error);
    }
};

const readPrivateKey = async () => {
    try {
        if (!process.env.PRIVATE_KEY) {
            return readFile(path.resolve(__dirname, '../utils/.keys/private.pem'), {
                encoding: 'utf8',
            });
        }
        return process.env.PRIVATE_KEY;
    } catch (error) {
        throw new Error(error);
    }
};

const signResponse = async (response) => {
    try {
        const privateKey = await readPrivateKey();
        return jwt.sign(response, { key: privateKey, passphrase: 'abcd' }, { algorithm: 'RS256' });
    } catch (error) {
        throw new Error(error);
    }
};

const checkMachine = async (userId, machineId) => {
    try {
        const isMachine = await LaundromatBusiness.knex().raw(`
        SELECT machines.id from  "laundromatBusiness"
        join stores on stores."businessId" = "laundromatBusiness".id
        join machines on machines."storeId" = stores.id
        where "laundromatBusiness"."userId" = ${userId}
        and machines.id = ${machineId}
        `);
        if (isMachine.rows.length) {
            return true;
        }
        return false;
    } catch (error) {
        throw new Error(error);
    }
};

const getUserId = (socket) => {
    const token = socket.handshake.query.authtoken;
    const decodedToken = jwt.decode(token);
    return decodedToken.id;
};

const signUIResponse = (response) => jwt.sign({ response }, process.env.JWT_SECRET_TOKEN);

exports.verifyRequest = verifyRequest;
exports.signResponse = signResponse;
exports.signUIResponse = signUIResponse;
exports.checkMachine = checkMachine;
exports.getUserId = getUserId;
