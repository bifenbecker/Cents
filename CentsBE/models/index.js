require('dotenv').config();
var environment = process.env.NODE_ENV || 'development';
var config = require('../knexfile.js')[environment];
const knex = require('knex')(config);
const { Model } = require('objection');

Model.knex(knex);

module.exports = Model;
