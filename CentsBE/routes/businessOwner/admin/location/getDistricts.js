const Business = require('../../../../models/laundromatBusiness');

const getBusiness = require('../../../../utils/getBusiness');

async function getDetails(businessId) {
    try {
        const details = await Business.knex().raw(
            `Select regions.id as "regionId", regions.name as "regionName", districts.id as "id", 
            districts.name as "name" from "regions"
            INNER JOIN "districts" on "regions"."id" = "districts"."regionId"
            WHERE "regions"."businessId"= ${businessId}
            AND "regions"."isDeleted" = ${false} AND "districts"."isDeleted" = ${false} 
            ORDER BY "regions"."name", "districts"."name"`,
        );
        return details.rows;
    } catch (error) {
        throw Error(error);
    }
}

const getDistricts = async (req, res, next) => {
    try {
        const businessDetails = await getBusiness(req);
        if (!businessDetails) {
            res.status(400).json({
                error: 'Business not found.',
            });
        } else {
            const districts = await getDetails(businessDetails.id);
            res.json({
                districts,
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = exports = {
    getDistricts,
    getDetails,
};
