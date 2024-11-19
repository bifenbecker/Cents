require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hashPasswordGenerator, passwordGenerator } = require('../../../utils/passwordGenerator');

describe('test passwordGenerator', () => {
    it('should return hashed password', async () => {
        const hashedPassword = await hashPasswordGenerator();

        expect(hashedPassword.includes('$argon2i$')).to.be.true;
        expect(hashedPassword.includes('$v=19$')).to.be.true;
        expect(hashedPassword.includes('$m=4096,t=3,p=1$')).to.be.true;
        expect(hashedPassword.length).to.equal(95);
    });

    it('should generate password', async () => {
        const password = passwordGenerator();
        expect(password.length).to.equal(8);
    })

})
