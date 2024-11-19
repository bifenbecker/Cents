const Model = require('../models/index');
const { addPricingTypeToLineItems } = require('../jakelib/addPricingTypeToHistoricalLineItems');

exports.up = async function(knex) {
    Model.knex(knex);    
    await addPricingTypeToLineItems();
  };
  
  exports.down = async  function(knex) {
    return;
  };