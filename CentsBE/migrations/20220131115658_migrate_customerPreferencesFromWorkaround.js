const CustomerPrefOptions = require('../models/customerPrefOptions.js');
const BusinessCustomerPreferences = require('../models/businessCustomerPreferences.js');
const PreferenceOptions = require('../models/preferenceOptions.js');
const CustomerPreferences = require('../models/customerPreferences.js');
const CustomerPreferencesOptionSelection = require('../models/customerPreferencesOptionSelection.js');
const { Model } = require("objection");

async function clearTables(knex) {

    // order matters here, because of fk constraints
    await knex('customerPreferencesOptionSelection')
        .del();
    await knex('preferenceOptions')
        .del();
    await knex('businessCustomerPreferences')
        .del();
}

exports.up = async function (knex) {
    await clearTables(knex);

    Model.knex(knex);

    // step 1: migrate customerPrefOptions into businessCustomerPreferences
    const customerPrefOptions = await CustomerPrefOptions.query()
        .select()
        .where({ deletedAt: null });

    let trx = null;
    try {
        trx = await BusinessCustomerPreferences.startTransaction();
        await BusinessCustomerPreferences.query(trx)
            .insert(customerPrefOptions.map((pref) => {
                    return {
                        id: pref.id,
                        businessId: pref.businessId,
                        type: pref.type,
                        fieldName: pref.fieldName,
                        createdAt: pref.createdAt,
                        updatedAt: pref.updatedAt,
                        deletedAt: pref.deletedAt,
                        isDeleted: pref.isDeleted,
                    };
                }
            ));

        // step 2: migrate customerPrefOptions options field as preferenceOptions entity
        let preferenceOptions = [];
        customerPrefOptions.forEach((pref) => {
            let options = JSON.parse(JSON.stringify(pref.options));
            options.forEach(option => {
                option.isDefault = typeof option.isDefault !== 'undefined' ? option.isDefault : false;
                option.businessCustomerPreferenceId = pref.id;
                preferenceOptions.push(option);
            });
        });

        const preferencesOptions = await PreferenceOptions.query(trx)
            .insertAndFetch(preferenceOptions);

        // step 3: migrate customer selected options to customerPreferenceOptionSelection
        const customerPreferencesSelection = await CustomerPreferences.query()
            .select()
            .where({ deletedAt: null });

        let customerPreferencesOptionSelection = [];
        customerPreferencesSelection.forEach(selection => {

            // multiple options selected in this selection
            if (/\|/.test(selection.choice)) {
                const choices = selection.choice.split('|');
                choices.forEach(choiceValue => {
                    const matchingOptions = preferencesOptions.filter( option => option.value === choiceValue && option.businessCustomerPreferenceId === selection.optionId);
                    matchingOptions.forEach(option => customerPreferencesOptionSelection.push({
                        preferenceOptionId: option.id,
                        centsCustomerId: selection.customerId
                    }))
                });
            } else { // it's a selection with only one choice, no need to split the chosen value
                const matchingOption = preferencesOptions.find(option => option.value === selection.choice && option.businessCustomerPreferenceId === selection.optionId)
                if (typeof matchingOption !== "undefined"){
                    customerPreferencesOptionSelection.push({
                        preferenceOptionId: matchingOption.id,
                        centsCustomerId: selection.customerId,
                    });
                }
            }
        });

        await CustomerPreferencesOptionSelection.query(trx).insert(customerPreferencesOptionSelection);
        await trx.commit();
    } catch (e) {
        if (trx) {
            await trx.rollback(e);
        }
        throw e;
    }

};

exports.down = async function (knex) {
    await clearTables(knex);
};
