const nock = require('nock');
const querystring = require('querystring');

/**
 * Retrieve the proper card balance for given test scenarios
 * 
 * @param {String} testCase 
 * @param {Number} resultCode 
 * @param {Number} cardBalance 
 * @param {String} netOrderTotal 
 */
 function getExpectedEsdBalance(testCase, resultCode, cardBalance, netOrderTotal) {
  if (testCase === 'success') {
    return Number(cardBalance - netOrderTotal);
  }

  if (testCase !== 'success' && resultCode === 153) {
    return cardBalance;
  }

  if (testCase !== 'success' && resultCode === 1) {
    return 0.0;
  }

  return Number(cardBalance - netOrderTotal);
}

/**
 * Build the expected payload and response info for updating balance API
 * 
 * @param {Object} esdReader
 * @param {String} testCase
 */
 function buildUpdateBalancePayload(esdReader, testCase, resultCode) {
  const requestBody = {
      deviceSerialNumber: esdReader.deviceSerialNumber,
      esdLocationId: esdReader.esdLocationId,
      cardSerialNumber: 111111,
      cardBalance: 100,
      netOrderTotal: '50',
  };
  const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic esd_token',
  };
  const params = {
      LOCATION_ID: requestBody.esdLocationId,
      COMMAND_ID: 13,
      DEVICE_SERIAL_NUMBER: requestBody.deviceSerialNumber,
      CARD_SERIAL_NUMBER: requestBody.cardSerialNumber,
      CARD_TYPE: 0,
      CARD_CLASS: 0,
      BONUS: 0,
      CARD_BALANCE: Number(requestBody.cardBalance - requestBody.netOrderTotal),
  };
  const formattedParams = querystring.stringify(params);
  const expectedBalance = getExpectedEsdBalance(
      testCase,
      resultCode,
      requestBody.cardBalance,
      requestBody.netOrderTotal,
  );
  const expectedEsdResponse = {
      data: {
        CardUpdated: testCase === 'success' ? true : false,
        ResultCode: resultCode,
        Balance: expectedBalance,
      },
  };
  const expectedApiResponse = {
      success: true,
      data: expectedEsdResponse.data,
  };

  return [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse];
}

/**
 * Build the expected payload and response info for getting reader status API
 * 
 * @param {Object} esdReader
 */
 function buildCardReaderStatusPayload(esdReader) {
  const requestBody = {
      deviceSerialNumber: esdReader.deviceSerialNumber,
      esdLocationId: esdReader.esdLocationId,
  };
  const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic esd_token',
  };
  const params = {
      LOCATION_ID: requestBody.esdLocationId,
      COMMAND_ID: 10,
      DEVICE_SERIAL_NUMBER: requestBody.deviceSerialNumber,
  };
  const formattedParams = querystring.stringify(params);
  const expectedEsdResponse = {
      data: {
          Machines: [
            {
              Label: requestBody.deviceSerialNumber,
              IsReadyToVend: true,
              IsOnline: true,
            },
          ],
          ResultCode: 1,
          ResultText: 'Machine information retrieved successfully.',
      },
  };
  const expectedApiResponse = {
      success: true,
      data: expectedEsdResponse.data,
  };

  return [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse];
}

/**
 * Build the expected payload and response info for getting card balance API
 * 
 * @param {Object} esdReader
 * @param {String} testCase
 * @param {Number} resultCode
 */
 function buildGetCardBalancePayload(esdReader, testCase, resultCode) {
  const requestBody = {
      deviceSerialNumber: esdReader.deviceSerialNumber,
      esdLocationId: esdReader.esdLocationId,
  };
  const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic esd_token',
  };
  const params = {
      LOCATION_ID: requestBody.esdLocationId,
      COMMAND_ID: 12,
      DEVICE_SERIAL_NUMBER: requestBody.deviceSerialNumber,
  };
  const formattedParams = querystring.stringify(params);
  const expectedEsdResponse = {
      data: {
          DatabaseID: 'database_id',
          ReaderID: 'random_reader_id',
          ReaderSerialNumber: requestBody.deviceSerialNumber,
          CardSerialNumber: 0,
          CardReady: testCase === 'success' ? true : false,
          CardType: 0,
          CardClass: 0,
          Bonus: 0,
          Balance: 100,
          ResultCode: resultCode,
          ResultText: 'MoneyCard query response received successfully.',
      },
  };
  const expectedApiResponse = {
      success: testCase === 'success' ? true : false,
      data: expectedEsdResponse.data,
  };

  return [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse];
}

/**
 * Mock the ESD API
 * 
 * @param {Object} headers
 * @param {String} formattedParams
 * @param {Object} expectedEsdResponse
 */
 function mockEsdApi(headers, formattedParams, expectedEsdResponse) {
  const url = 'https://mapp.mylaundrylink.com';
  nock(url, {
      reqheaders: headers,
  })
      .persist()
      .post('/CENTS', formattedParams)
      .reply(200, expectedEsdResponse.data);
}

module.exports = exports = {
  buildUpdateBalancePayload,
  buildGetCardBalancePayload,
  buildCardReaderStatusPayload,
  mockEsdApi,
}
