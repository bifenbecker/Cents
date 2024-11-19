const Device = require('../../../models/device');
const Business = require('../../../models/laundromatBusiness');
const { deviceStatuses } = require('../../../constants/constants');
const {
    NotFoundException,
    BadRequestException,
    ConflictException,
    NotAllowedException,
} = require('../../../constants/httpExceptions');

async function validateBusinessWithDeviceUow(payload, errorHandler) {
    const { transaction, deviceId, currentUser } = payload;
    const device = await Device.query(transaction).findById(deviceId).withGraphJoined('[batch]');
    if (!device) {
        const error = new NotFoundException('Device is not found');
        errorHandler(error);
        throw error;
    }

    if (device.status === deviceStatuses.OFFLINE || !device.name) {
        const error = new BadRequestException('Can not create a machine from offline device');
        errorHandler(error);
        throw error;
    }

    if (device.isPaired) {
        const error = new ConflictException('Device is already paired');
        errorHandler(error);
        throw error;
    }

    const business = await Business.query(transaction).findOne({
        userId: currentUser.id,
    });
    if (!business) {
        const error = new NotFoundException('Business is not found');
        errorHandler(error);
        throw error;
    }

    if (business.id !== device.batch?.businessId) {
        const error = new NotAllowedException('Device is not belonged to your business');
        errorHandler(error);
        throw error;
    }

    return { ...payload, device };
}

module.exports = validateBusinessWithDeviceUow;
