require('../../testHelper');
const { chai, expect } = require('../../support/chaiHelper');
const Base = require('../../../services/base');

class BaseChild extends Base {
    constructor() {
        super();
        this.isPerformCalled = false;
    };

    async perform() {
        this.isPerformCalled = true;
    };
};

describe('test Base', () => {
    it('should build Base instance', async () => {
        const base = new Base();

        expect(base.transaction).to.be.null;
        expect(base.execute).to.exist;
        expect(base.startTransaction).to.exist;
        expect(base.commitTransaction).to.exist;
        expect(base.rollbackTransaction).to.exist;
        expect(base.perform).to.exist;
    });
    
    it('should throw an error when instance not extended from Base', async () => {
        const base = new Base();

        await expect(base.execute()).to.be.rejectedWith('Not implemented perform in Base');
        expect(base.perform.bind({ constructor: { name: 'Base' } })).to.throw('Not implemented perform in Base');
    });

    it('test execute when instance extednded from Base', async () => {
        const baseChild = new BaseChild();
        const startTransactionSpy = chai.spy.on(baseChild, 'startTransaction');
        const performSpy = chai.spy.on(baseChild, 'perform');
        const commitTransactionSpy = chai.spy.on(baseChild, 'commitTransaction');

        await baseChild.execute();

        expect(startTransactionSpy).to.have.been.called();
        expect(performSpy).to.have.been.called();
        expect(commitTransactionSpy).to.have.been.called();
        expect(baseChild.isPerformCalled).to.be.true;
    });

    it(`shouldn't call rollbackTransaction when instance not extended from Base and transaction is null `, async () => {
        const base = new Base();
        base.startTransaction = () => {};
        const rollbackTransactionSpy = chai.spy.on(base, 'rollbackTransaction');

        await expect(base.execute()).to.be.rejectedWith('Not implemented perform in Base');
        expect(rollbackTransactionSpy).to.have.not.been.called();
    });
});
