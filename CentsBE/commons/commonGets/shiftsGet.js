const Business = require('../../models/laundromatBusiness');

const allShifts = async (businessId) => {
    try {
        const shifts = await Business.query()
            .select('shifts.id as id')
            .join('stores', 'stores.businessId', 'laundromatBusiness.id')
            .join('shifts', 'shifts.storeId', 'stores.id')
            .where('laundromatBusiness.id', businessId);
        return shifts.map((shift) => shift.id);
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = exports = allShifts;
