require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const validateDriveUow = require('../../../../uow/archive/validateDriveUow');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { routeStatuses } = require('../../../../constants/constants');

describe('validateDriveUow test', function () {
    let teamMember;
    beforeEach(async () => {
        teamMember = await factory.create(FACTORIES_NAMES.teamMember);
    });

    it('should throw error if invalid payload passed', async () => {
        await expect(validateDriveUow()).to.be.rejected;
        await expect(validateDriveUow({})).to.be.rejected;
        await expect(validateDriveUow(null)).to.be.rejected;
    });

    it('should throw error if employee is in a route', async () => {
        await factory.create(FACTORIES_NAMES.route, { driverId: teamMember.id });
        const payload = {
            modelId: teamMember.id,
        };
        await expect(validateDriveUow(payload, () => {})).to.be.rejectedWith(
            'Unable to archive - employee is in a route',
        );
    });

    it('should successfully return payload', async () => {
        await factory.create(FACTORIES_NAMES.route, {
            driverId: teamMember.id,
            status: routeStatuses.COMPLETED,
        });
        const payload = {
            modelId: teamMember.id,
        };

        const res = await validateDriveUow(payload);
        expect(res).to.deep.equal(payload);
    });
});
