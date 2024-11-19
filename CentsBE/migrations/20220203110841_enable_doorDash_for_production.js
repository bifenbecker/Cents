const { transaction } = require('objection');
const CentsDeliverySettings = require('../models/centsDeliverySettings');
const Model = require('../models/index');

const currentDoorDashStores = [
  41,
  42,
  68,
  57,
  75,
  90,
  96,
  99,
  85,
  86,
  142,
  98,
  155,
  120,
  147,
  113,
  103,
  105,
  106,
  119,
  123,
  110,
  61,
  82,
  83,
  84,
  95,
  47,
  192,
  204,
  207,
  197,
  166,
  211,
  58,
  59,
  60,
  210,
  216,
  202,
  196,
  199,
  164,
  212,
  205,
  144,
  172,
  223,
  163,
  220,
  192,
  221,
  234,
  236,
  235,
  167,
  239,
  238,
  240,
  214,
  242,
  244,
  253,
  200,
  257,
  243,
  258,
  93,
  260,
  259,
  245,
  246,
  247,
  248,
  249,
  250,
  251,
  252,
  266,
  265,
  261,
  231,
  262,
  263,
  267,
  273,
  274,
  208,
  281,
  282,
  286,
  285,
  124,
  255,
  137,
  138,
  54,
  276,
  279,
  275,
  225,
  291,
  298,
  292,
  295,
  296,
  297,
  304,
  305,
  311,
  312,
  315,
  302,
  299,
  317,
  308,
  319,
  321,
  322,
  327,
  333,
  338,
  335,
  232,
  328,
  187,
  101,
  339,
  342,
  340,
  345,
  349,
  344,
  324,
];

/**
 * Disable DoorDash for an individual store
 * 
 * @param {Number} settingId 
 * @param {void} transaction 
 */
 async function disableDoorDashForIndividualStore(settingId, transaction) {
  const updatedSetting = await CentsDeliverySettings.query(transaction)
    .findById(settingId)
    .patch({ doorDashEnabled: false })
    .returning('*');

    return updatedSetting;
}

/**
 * Enable DoorDash for an individual store
 * 
 * @param {Number} settingId 
 * @param {void} transaction 
 */
async function enableDoorDashForIndividualStore(settingId, transaction) {
  const updatedSetting = await CentsDeliverySettings.query(transaction)
    .findById(settingId)
    .patch({ doorDashEnabled: true })
    .returning('*');

    return updatedSetting;
}

/**
 * Enable DoorDash for production stores
 */
async function enableDoorDashStores() {
  let trx = null;
  try {
    trx = await transaction.start(CentsDeliverySettings.knex());
    const prodDeliverySettings = await CentsDeliverySettings.query(trx).whereIn('storeId', currentDoorDashStores);
    let updatedProdStores = prodDeliverySettings.map(setting => (
      enableDoorDashForIndividualStore(setting.id, trx)
    ));
    updatedProdStores = await Promise.all(updatedProdStores);
    await trx.commit();
    return updatedProdStores;
  } catch (e) {
    if (trx) {
      await trx.rollback();
    }
  }
}

/**
 * Disable DoorDash for production stores
 */
 async function disableDoorDashStores() {
  let trx = null;
  try {
    trx = await transaction.start(CentsDeliverySettings.knex());
    const prodDeliverySettings = await CentsDeliverySettings.query(trx).whereIn('storeId', currentDoorDashStores);
    let updatedProdStores = prodDeliverySettings.map(setting => (
      disableDoorDashForIndividualStore(setting.id, trx)
    ));
    updatedProdStores = await Promise.all(updatedProdStores);
    await trx.commit();
    return updatedProdStores;
  } catch (e) {
    if (trx) {
      await trx.rollback();
    }
  }
}

exports.up = async function(knex) {
  if (process.env.ENV_NAME !== 'production') return;

  Model.knex(knex);
  
  await enableDoorDashStores();
};

exports.down = async  function(knex) {
  if (process.env.ENV_NAME !== 'production') return;

  Model.knex(knex);

  await disableDoorDashStores();
};
