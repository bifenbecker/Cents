const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const faker = require('faker');
const chaiAsPromised = require('chai-as-promised');
const spies = require('chai-spies');
const chaiDateString = require('chai-date-string');

chai.use(chaiDateString);
chai.use(chaiAsPromised);
chai.use(spies);
chai.use(function (_, utils) {
    chai.Assertion.addMethod('equalToDateTime', function (date) {
        const obj = utils.flag(this, 'object');
        new chai.Assertion(obj).to.be.instanceof(Date, 'expected value is not a Date object');
        new chai.Assertion(date).to.be.instanceof(Date, 'actual value is not a Date object');
        new chai.Assertion(obj.getTime()).to.be.equal(date.getTime());
    });
});

chai.should();

module.exports = {
    chai,
    expect,
    faker,
    assert,
};
