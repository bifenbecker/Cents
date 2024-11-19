const { transaction } = require('objection');
const Regions = require('../../../../models/region');
const Districts = require('../../../../models/district');

const getBusiness = require('../../../../utils/getBusiness');

function mapDistricts(districts, region) {
    const mappedDistricts = districts.map((district) => {
        const newDistrict = {
            ...district,
            regionId: region.id,
        };
        return newDistrict;
    });
    return mappedDistricts;
}

module.exports = exports = async (req, res, next) => {
    let trx = null;
    try {
        const { isNew } = req.body;
        const business = await getBusiness(req);
        if (isNew) {
            trx = await transaction.start(Regions.knex());
            const { name, districts } = req.body.region;
            const region = await Regions.query(trx)
                .insert({
                    name,
                    businessId: business.id,
                })
                .returning('*');
            if (districts.length) {
                const mappedDistricts = mapDistricts(districts, region);
                await Districts.query(trx).insert(mappedDistricts);
            }
            await trx.commit();
            res.status(200).json({
                success: true,
            });
        } else {
            const { region, newRecords, updateRecords } = req.body;
            const { id, name } = region;
            trx = await transaction.start(Regions.knex());
            await Regions.query(trx)
                .patch({
                    name,
                })
                .findById(id);

            if (newRecords && newRecords.length) {
                await Districts.query(trx).insert(newRecords);
            }
            if (updateRecords && updateRecords.length) {
                const update = updateRecords.map(async (record) =>
                    Districts.query(trx)
                        .patch({
                            name: record.name,
                        })
                        .findById(record.id),
                );

                await Promise.all(update);
            }
            await trx.commit();
            res.json({
                success: true,
            });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
};
