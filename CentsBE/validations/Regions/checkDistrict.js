const Business = require('../../models/laundromatBusiness');
const mapRegions = require('../../utils/regionMapper');

async function validateDistrict(req, business, districts, createDistrict = false) {
    try {
        let error = '';
        const accountDetails = await Business.query()
            .findById(business.id)
            .withGraphJoined(
                `regions(notDeleted).
        districts(notDeleted)`,
            )
            .modifiers({
                notDeleted: (query) => {
                    query.where('isDeleted', false);
                },
            });

        const { regions } = accountDetails;
        const regionDistricts = mapRegions(regions);

        if (typeof districts === 'number') {
            /* Check validity of id and isDeleted for the region and district. */
            /* filter the record with given id
             * and check isDeleted for region and district and  id. */
            const district = regionDistricts.filter(
                (regionDistrict) => regionDistrict.id === districts,
            );
            if (district.length === 0) {
                error = 'invalid districtId.';
            }
            req.district = district;
            return error;
        }

        /**
         * Check for id,
         * Check whether the district is deleted or not.
         * Check whether the district is associated with the current region or not.
         */

        /* Validation for update records. */
        if (!createDistrict) {
            for (const i of districts) {
                const currentDistrict = i;
                /* Check for validity with regionId and district id. */
                const isDistrict = regionDistricts.filter(
                    (regionDistrict) =>
                        regionDistrict.id === currentDistrict.id &&
                        regionDistrict.regionId === currentDistrict.regionId,
                );
                /* if district is not found */
                if (isDistrict.length === 0) {
                    error = `Invalid district id = ${currentDistrict.id}`;
                    return error;
                }

                /* if district is found check for name validity. */
                const isNameValid = regionDistricts.filter(
                    (regionDistrict) =>
                        regionDistrict.id !== currentDistrict.id &&
                        regionDistrict.name.toUpperCase() === currentDistrict.name.toUpperCase() &&
                        regionDistrict.id === currentDistrict.regionId,
                );
                if (isNameValid.length) {
                    error = `${currentDistrict.name} already exists.`;
                    return error;
                }
            }
            return error;
        }
        // Validation for new Records.
        for (const i of districts) {
            const currentDistrict = i;
            /* Check if given district name already exits in the current region. */
            const isNameAlreadyThere = regionDistricts.filter(
                (regionDistrict) =>
                    currentDistrict.name.toUpperCase() === regionDistrict.name.toUpperCase() &&
                    regionDistrict.regionId === currentDistrict.regionId,
            );
            if (isNameAlreadyThere.length) {
                error = `${currentDistrict.name} already exits.`;
                return error;
            }
        }
        return error;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = validateDistrict;
