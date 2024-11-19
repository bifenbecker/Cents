// The purpose of this migration is to set default as all zones for a shift timing where currently there are no zones assigned.

const {
    updateTimingsWithNoZonesToAllZones
  } = require("../lib/timingsTableUpdateWithAllZones");

exports.up = async function (knex) {
  if (process.env.ENV_NAME === 'staging' || process.env.ENV_NAME === 'production') return;
    await updateTimingsWithNoZonesToAllZones();
};
  
exports.down = function (knex) {
  return;
  };