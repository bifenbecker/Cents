require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const getUniqThemes = require('../../../../utils/superAdmin/getUniqThemes');

describe('test getUniqThemes', () => {
    describe('should sort themes correctly', () => {
        const businessTheme = {
            primaryColor: '#3a7f2e',
            borderRadius: '#0px',
            logoUrl: 'https://cents-product-images.s3.us-east-2.amazonaws.com/Cents+LOGO.png',
            id: 1,
        };
        const customStoreTheme = {
            primaryColor: '#3D98FF',
            borderRadius: '#31px',
            logoUrl:
                'https://cents-bucket.s3.us-east-2.amazonaws.com/4b97fb9b-e1ee-4539-9205-d7b35c84be6a-3dbc4c24-91ef-4f82-b8ff-3bb0e6ac082d-soap_box_logo.png',
        };

        it('only with Business theme', async () => {
            const storeThemes = [];
            const result = getUniqThemes(businessTheme, storeThemes);

            expect(result).to.be.an('array').lengthOf(1);

            const firstUniqTheme = result[0];
            expect(firstUniqTheme).have.keys([
                'primaryColor',
                'borderRadius',
                'logoUrl',
                'appliedTo',
            ]);
            expect(firstUniqTheme.appliedTo).to.be.an('array').lengthOf(1);
            expect(firstUniqTheme.appliedTo[0]).deep.equal(businessTheme);
        });

        it('with several themes', async () => {
            const theme2 = { ...businessTheme, id: 2 };
            const theme3 = { ...customStoreTheme, id: 3 };
            const theme4 = { ...businessTheme, id: 4 };
            const theme5 = { ...customStoreTheme, id: 5 };
            const theme6 = { ...customStoreTheme, id: 6 };

            const storeThemes = [theme2, theme3, theme4, theme5, theme6];
            const result = getUniqThemes(businessTheme, storeThemes);

            expect(result).to.be.an('array').lengthOf(2);

            const firstUniqTheme = result[0];
            expect(firstUniqTheme).have.keys([
                'primaryColor',
                'borderRadius',
                'logoUrl',
                'appliedTo',
            ]);
            expect(firstUniqTheme.appliedTo[0]).deep.equal(businessTheme);
            expect(firstUniqTheme.appliedTo[1]).deep.equal(theme2);
            expect(firstUniqTheme.appliedTo[2]).deep.equal(theme4);

            const secondUniqTheme = result[1];
            expect(secondUniqTheme).have.keys([
                'primaryColor',
                'borderRadius',
                'logoUrl',
                'appliedTo',
            ]);
            expect(secondUniqTheme.appliedTo[0]).deep.equal(theme3);
            expect(secondUniqTheme.appliedTo[1]).deep.equal(theme5);
            expect(secondUniqTheme.appliedTo[2]).deep.equal(theme6);
        });
    });
});
