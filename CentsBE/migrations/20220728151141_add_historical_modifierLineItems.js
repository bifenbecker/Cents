const Model = require('../models/index');
const { migrateExistingModifierLineItems } = require('../jakelib/migrateExistingModifierLineItems');

exports.up = async function(knex) {
    Model.knex(knex);    
    await migrateExistingModifierLineItems();
  };
  
  exports.down = async  function(knex) {
    return;
  };