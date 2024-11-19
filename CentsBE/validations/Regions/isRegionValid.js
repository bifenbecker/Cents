const Business = require('../../models/laundromatBusiness');

module.exports = exports = async function isRegionValid(business, name, id) {
    try {
        let error = '';
        let isNew = true;

        const details = await Business.query().findById(business.id).withGraphJoined('regions');
        const { regions } = details;
        if (regions) {
            /* if name and id is present -> Update Record */
            if (id !== undefined) {
                const isRegion = regions.filter((region) => region.id === id);
                /* Check if region is valid. */
                if (isRegion.length) {
                    const nameAlreadyExists = regions.filter(
                        (region) =>
                            region.name.toUpperCase() === name.toUpperCase() && region.id !== id,
                    );

                    /* Check if another region has same name. */

                    if (nameAlreadyExists.length) {
                        error = `${name} already exists therefore current region name can not be updated.`;
                    }
                } else {
                    error = "Region with given id doesn't exist.";
                }
                isNew = false;
            } else {
                // Create a new Region
                // Check if region name already exists or not.
                const alreadyExists = regions.filter(
                    (region) => region.name.toUpperCase() === name.toUpperCase(),
                );
                // Check if another region has same name.
                if (alreadyExists.length) {
                    error = `${name} already exists.`;
                }
            }
        }
        // No regions are present.
        return {
            error,
            isNew,
        };
    } catch (error) {
        throw Error(error);
    }
};
