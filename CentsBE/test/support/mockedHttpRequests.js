const nock = require('nock');

/**
 * 
 * @param {{address: string, postalCode: string, placeIdResponse: string}} regularFlowRequestResponse data for regular successfull flow 
 * @param {number} code (200 by default) HTTP response code
 * @param {*} alternativeBody - if this set `placeIdResponse` is ignored and entire HTTP response body is replaced with it
 * @returns {{ candidates: [{place_id: placeIdResponse}] }}
 */
const setupGetGooglePlacesIdRequestMock = ({address1, postalCode, placeIdResponse}, code = 200, alternativeBody) => 
    nock('https://maps.googleapis.com')
    .get('/maps/api/place/findplacefromtext/json')
    .query({
        input: `${address1} ${postalCode}`,
        inputtype: 'textquery',
        fields: 'place_id',
        key: process.env.GOOGLE_PLACES_API_KEY,
    })
    .reply(code, alternativeBody || { candidates: [{place_id: placeIdResponse}] });

const setupGetDoordashDriveDeliveriesHttpMock = ({thirdPartyDeliveryId, responseBody}, code = 200) => 
    nock(process.env.DOORDASH_API_URL, {
        reqheaders: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DOORDASH_API_KEY}`,
        }
    })
    .get(`/deliveries/${thirdPartyDeliveryId}`)
    .reply(code, responseBody);

const setupDoordashDeliveryEstimateHttpMock = ({ responseBody }, code = 200) =>
    nock(process.env.DOORDASH_API_URL, {
        reqheaders: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DOORDASH_API_KEY}`,
        }
    })
    .post('/estimates')
    .reply(code, responseBody);

module.exports = {
    setupGetGooglePlacesIdRequestMock,
    setupGetDoordashDriveDeliveriesHttpMock,
    setupDoordashDeliveryEstimateHttpMock,
}; 
