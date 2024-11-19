const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
chai.use(chaiHttp);

class ChaiHttpRequestHelper {
    request() {
        return chai.request(server);
    }
    static get(url, params = {}) {
        return this.prototype.request().get(url).query(params);
    }

    static post(url, params = {}, reqBody = {}) {
        return this.prototype.request().post(url).query(params).send(reqBody);
    }

    static put(url, params = {}, reqBody = {}) {
        return this.prototype.request().put(url).query(params).send(reqBody);
    }

    static patch(url, params = {}, reqBody = {}) {
        return this.prototype.request().patch(url).query(params).send(reqBody);
    }

    static patch(url, params = {}, reqBody = {}) {
        return this.prototype.request().patch(url).query(params).send(reqBody)

    }

    static delete(url, params = {}) {
        return this.prototype.request().delete(url).query(params);
    }
}

module.exports = exports = ChaiHttpRequestHelper;
