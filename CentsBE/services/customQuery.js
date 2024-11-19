const Mustache = require('mustache');
const fs = require('fs');
const Model = require('../models');

class CustomQuery {
    constructor(queryName, options = {}) {
        this.queryName = queryName;
        this.options = options;
    }

    execute() {
        return this.result();
    }

    async result() {
        const query = fs.readFileSync(`${__dirname}/../queries/${this.queryName}`, 'utf-8');
        const sqlQuery = Mustache.render(query, this.options);
        const { rows } = await Model.knex().raw(sqlQuery);
        return rows;
    }
}

module.exports = exports = CustomQuery;
