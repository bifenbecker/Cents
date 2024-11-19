const { transaction } = require('objection');
const BusinessSettings = require('../../../../models/businessSettings');
const TipSettings = require('../../../../models/tipSettings');
const ConvenienceFee = require('../../../../models/convenienceFee');
const Store = require('../../../../models/store');
const BagNoteTag = require('../../../../models/bagNoteTag');
const getBusiness = require('../../../../utils/getBusiness');
const { locationType } = require('../../../../constants/constants');

async function toggleBagTracking(business, payload) {
    let trx = null;
    try {
        trx = await transaction.start(BusinessSettings.knex());
        const settings = await BusinessSettings.query(trx)
            .patch(payload)
            .where('businessId', business.id)
            .returning('*');
        await Store.query(trx)
            .patch(payload)
            .where('businessId', '=', business.id)
            .andWhere((builder) => {
                builder.whereNotNull('hubId').orWhere('type', '=', locationType.HUB);
            });
        await trx.commit();
        return settings[0];
    } catch (error) {
        await trx.rollback();
        return error;
    }
}

const updateReceiptFooterMessage = async (business, payload) => {
    const updatedPayload = payload.receiptFooterMessage || 'Thank you for your order.';
    const settings = await BusinessSettings.query()
        .patch({ receiptFooterMessage: updatedPayload.trim() })
        .where('businessId', business.id)
        .returning('*');
    return settings[0];
};

async function toggleOtherSettings(business, payload) {
    const settings = await BusinessSettings.query()
        .patch(payload)
        .where('businessId', business.id)
        .returning('*');
    return settings[0];
}

async function toggleTip(business, payload) {
    const tipSettings = await TipSettings.query().where('businessId', business.id).first();
    if (typeof tipSettings === 'undefined') {
        await TipSettings.query().insert({
            tipType: 'PERCENTAGE',
            businessId: business.id,
            tipDollars: JSON.stringify({
                /* prettier-ignore */
                option1: 3.00,
                /* prettier-ignore */
                option2: 5.00,
                /* prettier-ignore */
                option3: 8.0,
            }),
            tipPercentage: JSON.stringify({
                option1: 10,
                option2: 15,
                option3: 20,
            }),
        });
    }
    const settings = await BusinessSettings.query()
        .patch(payload)
        .where('businessId', business.id)
        .returning('*');
    return settings[0];
}

async function updateTipSettings(business, payload) {
    const tipSettings = await TipSettings.query().where('businessId', business.id).first();

    if (Object.keys(payload)[0] === 'tipType') {
        await TipSettings.query().where('businessId', business.id).patch(payload);
    }

    if (Object.keys(payload)[0] === 'tipDollars') {
        const updatedPayload = { tipDollars: {} };
        updatedPayload.tipDollars = JSON.stringify({
            ...tipSettings.tipDollars,
            ...payload.tipDollars,
        });
        await TipSettings.query().where('businessId', business.id).patch(updatedPayload);
    }

    if (Object.keys(payload)[0] === 'tipPercentage') {
        const updatedPayload = { tipPercentage: {} };
        updatedPayload.tipPercentage = JSON.stringify({
            ...tipSettings.tipPercentage,
            ...payload.tipPercentage,
        });
        await TipSettings.query().where('businessId', business.id).patch(updatedPayload);
    }

    const settings = await BusinessSettings.query().where('businessId', business.id).first();
    return settings;
}

/**
 * Toggle the hasConvenienceFee setting and create a ConvenienceFee model if one does not exist
 *
 * @param {Object} business
 * @param {Object} payload
 * @returns {Object} settings
 */
async function toggleConvenienceFee(business, payload) {
    const convenienceFee = await ConvenienceFee.query().findOne({ businessId: business.id });

    if (typeof convenienceFee === 'undefined') {
        await ConvenienceFee.query().insert({
            businessId: business.id,
            fee: 4,
            feeType: 'PERCENTAGE',
        });
    }

    const settings = await BusinessSettings.query()
        .patch(payload)
        .where('businessId', business.id)
        .returning('*');
    return settings[0];
}

/**
 * Update or add new convenience fee for a business
 *
 * @param {Object} business
 * @param {Object} payload
 * @returns {Object} @var settings The business settings
 */
async function updateConvenienceFee(business, payload) {
    let trx = null;

    try {
        const { fee } = payload;
        const convenienceFee = await ConvenienceFee.query().findOne({ businessId: business.id });
        trx = await transaction.start(ConvenienceFee.knex());

        if (convenienceFee) {
            await ConvenienceFee.query(trx)
                .patch(payload)
                .findById(convenienceFee.id)
                .returning('*');
        } else {
            await ConvenienceFee.query(trx)
                .insert({
                    fee,
                    businessId: business.id,
                })
                .returning('*');
        }

        await trx.commit();

        const settings = await BusinessSettings.query().where('businessId', business.id).first();
        return settings;
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return error;
    }
}

/**
 * Add a BagNoteTag to the business
 *
 * @param {Object} business
 * @param {Object} payload
 */
async function addBagNoteTag(business, payload) {
    let trx = null;

    try {
        const { bagNoteTag } = payload;
        const existingNoteTag = await BagNoteTag.query().findOne({
            name: bagNoteTag,
            businessId: business.id,
            isDeleted: true,
        });
        trx = await transaction.start(BagNoteTag.knex());

        if (existingNoteTag) {
            await BagNoteTag.query(trx)
                .patch({
                    name: bagNoteTag,
                    isDeleted: false,
                    deletedAt: null,
                })
                .findById(existingNoteTag.id)
                .returning('*');
        } else {
            await BagNoteTag.query(trx)
                .insert({
                    name: bagNoteTag,
                    businessId: business.id,
                })
                .returning('*');
        }

        await trx.commit();

        const settings = await BusinessSettings.query().where('businessId', business.id).first();
        return settings;
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }

        return error;
    }
}

async function toggleSalesWeightSettings(business, payload) {
    let updatedPayload = { ...payload };
    if (payload.salesWeight === 'UPON_COMPLETION') {
        updatedPayload = { ...payload, isWeightUpOnCompletion: true };
    }
    const settings = await BusinessSettings.query()
        .patch(updatedPayload)
        .where('businessId', business.id)
        .returning('*');
    return settings[0];
}

async function accountSettings(req, res, next) {
    try {
        const business = await getBusiness(req);
        let settings;
        const bagTrackingKey = 'isBagTrackingEnabled';
        const requiresTipKey = 'allowInStoreTip';
        const salesWeightKey = 'salesWeight';
        const receiptFooterMessageKey = 'receiptFooterMessage';
        const convenienceToggleKey = 'hasConvenienceFee';
        const bagNoteTagKey = 'bagNoteTag';
        const settingsKeys = [
            'isWeightBeforeProcessing',
            'isWeightAfterProcessing',
            'isWeightUpOnCompletion',
            'isWeightReceivingAtStore',
            'requiresEmployeeCode',
            'requiresRack',
            'isCustomUrl',
            'termsOfServiceUrl',
            'isCustomPreferencesEnabled',
            'isHangDryEnabled',
            'hangDryInstructions',
        ];
        const tipSettingKeys = ['tipType', 'tipDollars', 'tipPercentage'];
        const convenienceFeeKey = 'fee';

        const payload = {
            [Object.keys(req.body)[0]]: Object.values(req.body)[0],
        };

        if (Object.keys(payload)[0] === receiptFooterMessageKey) {
            settings = await updateReceiptFooterMessage(business, payload);
        }

        if (Object.keys(payload)[0] === bagTrackingKey) {
            settings = await toggleBagTracking(business, payload);
        }

        if (Object.keys(payload)[0] === requiresTipKey) {
            settings = await toggleTip(business, payload);
        }

        if (tipSettingKeys.includes(Object.keys(payload)[0])) {
            settings = await updateTipSettings(business, payload);
        }

        if (Object.keys(payload)[0] === salesWeightKey) {
            settings = await toggleSalesWeightSettings(business, payload);
        }

        if (settingsKeys.includes(Object.keys(payload)[0])) {
            settings = await toggleOtherSettings(business, payload);
        }

        if (Object.keys(payload)[0] === convenienceFeeKey) {
            settings = await updateConvenienceFee(business, payload);
        }

        if (Object.keys(payload)[0] === convenienceToggleKey) {
            settings = await toggleConvenienceFee(business, payload);
        }

        if (Object.keys(payload)[0] === bagNoteTagKey) {
            settings = await addBagNoteTag(business, payload);
        }

        const tipSettings = await TipSettings.query().findOne({
            businessId: business.id,
        });

        const convenienceFee = await ConvenienceFee.query().findOne({
            businessId: business.id,
        });

        const bagNoteTags = await BagNoteTag.query().findOne({
            businessId: business.id,
            isDeleted: false,
        });

        settings.tipSettings = tipSettings || null;
        settings.convenienceFee = convenienceFee || null;
        settings.bagNoteTags = bagNoteTags || null;

        res.status(200).json({
            success: true,
            settings,
        });
    } catch (e) {
        next(e);
    }
}

module.exports = accountSettings;
