const { expect } = require('./chaiHelper');
// write model test helpers
const Knex = require('knex');
const config = require('../../knexfile')[process.env.NODE_ENV];
let knex = Knex(config);

const getAssociation = (model, association) => {
    return model.relationMappings[association];
};

const hasAssociation = (model, association) => {
    return expect(Boolean(getAssociation(model, association))).to.be.true;
};

const hasTable = (tableName) => {
    return knex.schema.hasTable(tableName);
};

const hasOne = (model, association) => {
    return expect(getAssociation(model, association).relation)
        .to.have.property('name')
        .to.equal('HasOneRelation');
};

const hasMany = (model, association) => {
    return expect(getAssociation(model, association).relation)
        .to.have.property('name')
        .to.equal('HasManyRelation');
};

const hasManyToMany = (model, association) => {
    return expect(getAssociation(model, association).relation)
        .to.have.property('name')
        .to.equal('ManyToManyRelation');
};

const belongsToOne = (model, association) => {
    return expect(getAssociation(model, association).relation)
        .to.have.property('name')
        .to.equal('BelongsToOneRelation');
};

const hasOneThrough = (model, association) => {
    return expect(getAssociation(model, association).relation)
        .to.have.property('name')
        .to.equal('HasOneThroughRelation');
};

module.exports = {
    hasAssociation,
    hasTable,
    hasMany,
    hasManyToMany,
    hasOne,
    belongsToOne,
    hasOneThrough,
};
