const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const Store = require('../../../models/store');
const PartnerSubsidiaryStore = require('../../../models/partnerSubsidiaryStore');

async function signIn(req, res, next) {
    try {
        const { storeId, password, residence } = req.body;
        const isStore = await Store.query()
            .withGraphJoined('settings(storeSettings)')
            .modifiers({
                storeSettings: (query) => {
                    query.select('processingCapability');
                },
            })
            .findById(storeId);
        const subsidiariesMap = await PartnerSubsidiaryStore.query()
            .withGraphFetched('partnerSubsidiary')
            .where({ storeId });

        let subsidiaryCode = null;
        if (isStore) {
            if (!isStore.password) {
                res.status(409).json({
                    success: false,
                    error: 'Please set password using our business manager app to log in.',
                });
                return;
            }

            const verifyPassword = await argon2.verify(isStore.password, password);
            if (!verifyPassword) {
                res.status(403).json({
                    success: false,
                    error: 'Invalid password.',
                });
                return;
            }

            if (isStore.isLocationResidential() && !residence) {
                res.status(403).json({
                    success: false,
                    error: 'Please login using residential app',
                });
                return;
            }

            if (!isStore.isLocationResidential() && residence) {
                res.status(403).json({
                    success: false,
                    error: 'Please login using employee app',
                });
                return;
            }

            if (residence && subsidiariesMap.length > 0) {
                const subsidiaries = subsidiariesMap.map((map) => map.partnerSubsidiary);
                const residentialSubsidiary = subsidiaries.filter(
                    (subsidiary) => subsidiary.type === 'RESIDENTIAL',
                );
                subsidiaryCode = residentialSubsidiary[0].subsidiaryCode;
            }

            const token = jwt.sign(
                { id: storeId, type: isStore.type },
                process.env.JWT_SECRET_TOKEN,
            );
            const { name, address, city, state, zipCode, type, id, settings } = isStore;
            res.status(200).json({
                success: true,
                token,
                name,
                address,
                city,
                state,
                type,
                zipCode,
                isHub: isStore.isHub,
                id,
                subsidiaryCode,
                processingCapability: settings.processingCapability,
            });
        } else {
            res.status(403).json({
                success: false,
                error: 'Invalid store id.',
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = signIn;
