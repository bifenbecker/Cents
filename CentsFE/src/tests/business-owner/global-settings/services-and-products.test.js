import React from 'react';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

import ServicesAndProducts from '../../../components/business-owner/global-settings/locations/services-and-products';
import PricePerService from '../../../components/business-owner/global-settings/locations/price-per-service';
import {servicesAndProductsTabValues} from '../../../constants';
import PricePerProduct from '../../../components/business-owner/global-settings/locations/price-per-product';
import actionTypes from '../../../actionTypes';
import locationsReducer from '../../../reducers/businessOwner/globalSettings/locations';
import {createNamespacer} from '../../../utils/reducers';

const locationsAT = actionTypes.businessOwner.globalSettings.locations;

const mockStore = configureStore();
const initState = {
  businessOwner: {
    globalSettings: {
      locations: {
        list: [
          {
            id: 1,
            name: 'Store',
            city: 'City1',
            address: 'Store Address',
            totalRecords: '15'
          },
          {
            id: 12,
            name: 'Second Store',
            city: 'City',
            address: 'Second Address',
            totalRecords: '15'
          },
          {
            id: 14,
            name: 'Stand Alone Store',
            city: 'sfasknfasl',
            address: 'Stand Alone Store',
            totalRecords: '15'
          },
          {
            id: 20,
            name: 'Hub',
            city: 'City',
            address: 'Hub Address',
            totalRecords: '15'
          },
          {
            id: 24,
            name: 'Big B Laundromat',
            city: 'San Francisco',
            address: '805 Columbus Ave',
            totalRecords: '15'
          },
          {
            id: 26,
            name: 'Name',
            city: 'City',
            address: 'Address',
            totalRecords: '15'
          },
          {
            id: 27,
            name: 'Rollback',
            city: 'Rollback',
            address: 'Test Rollback',
            totalRecords: '15'
          },
          {
            id: 31,
            name: 'test location',
            city: 'new jersey',
            address: 'new jersey',
            totalRecords: '15'
          },
          {
            id: 32,
            name: 'new location',
            city: 'test city',
            address: 'address',
            totalRecords: '15'
          },
          {
            id: 33,
            name: 'Bret Harte',
            city: 'San Braepur ',
            address: '196 Bret Harte',
            totalRecords: '15'
          },
          {
            id: 34,
            name: 'Falcon Dragon',
            city: 'Hawthorne',
            address: 'Space X',
            totalRecords: '15'
          },
          {
            id: 35,
            name: 'Testing 123',
            city: 'testing',
            address: 'testing',
            totalRecords: '15'
          },
          {
            id: 36,
            name: 'test location',
            city: 'test city',
            address: 'test address',
            totalRecords: '15'
          },
          {
            id: 37,
            name: 'test location one',
            city: 'City',
            address: 'test location one',
            totalRecords: '15'
          },
          {
            id: 38,
            name: 'test location two',
            city: 'test city',
            address: 'test location two',
            totalRecords: '15'
          }
        ],
        needsRegions: true,
        showFullPageError: false,
        fullServiceError: '',
        errorMessage: '',
        selectedLocation: {
          id: 1,
          businessId: 2,
          name: 'Store',
          address: 'Store Address',
          city: 'City1',
          state: 'Alaska',
          zipCode: '12343',
          phoneNumber: '0989874567',
          districtId: 4,
          isHub: false,
          hubId: 20,
          stripeLocationId: 'tml_Dp84Hw1zi660Yn',
          stripeTerminalId: null,
          offersFullService: true,
          locationsServed: [],
          timings: [
            {
              startDay: 0,
              endDay: 6,
              startTime: '1970-01-01T01:00:00.000Z',
              endTime: '1970-01-01T18:30:00.000Z'
            }
          ],
          businessServiceCount: 23,
          storeServiceCount: 14
        },
        showSaveLocationScreen: false,
        isEdit: false,
        saveLocationCallInProgress: false,
        isLocationCallInProgress: false,
        newLocation: {
          name: '',
          phoneNumber: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          districtId: null
        },
        errorFields: {},
        isShiftsCallInProgress: false,
        selectedLocationShiftsData: null,
        unTouchedSelectedLocationShiftsData: null,
        selectedShiftIndex: 0,
        shiftsError: '',
        shiftsUpdateOrCreateError: '',
        districts: [
          {
            regionId: 18,
            regionName: 'name',
            id: 24,
            name: 'name'
          },
          {
            regionId: 4,
            regionName: 'Region',
            id: 4,
            name: 'District'
          },
          {
            regionId: 19,
            regionName: 'Region1',
            id: 25,
            name: 'Region1'
          },
          {
            regionId: 20,
            regionName: 'Region2',
            id: 26,
            name: 'Region2'
          }
        ],
        districtsCallInProgress: false,
        refreshLocations: false,
        regions: [
          {
            id: 18,
            businessId: 2,
            name: 'name',
            isDeleted: false,
            createdAt: '2020-05-19T11:13:43.277Z',
            updatedAt: '2020-05-19T11:13:43.277Z',
            districts: [
              {
                id: 24,
                regionId: 18,
                name: 'name',
                isDeleted: false,
                createdAt: '2020-05-19T11:13:43.277Z',
                updatedAt: '2020-05-19T11:13:43.277Z',
                stores: [
                  {
                    id: 31,
                    businessId: 2,
                    name: 'test location',
                    address: 'new jersey',
                    city: 'new jersey',
                    state: 'New Jersey',
                    zipCode: '28899',
                    phoneNumber: '9822',
                    createdAt: '2020-05-28T10:18:02.680Z',
                    updatedAt: '2020-05-28T10:18:02.680Z',
                    districtId: 24,
                    isHub: false,
                    hubId: null,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 26,
                    businessId: 2,
                    name: 'Name',
                    address: 'Address',
                    city: 'City',
                    state: 'Alabama',
                    zipCode: '32411',
                    phoneNumber: '2342151',
                    createdAt: '2020-05-19T11:18:52.492Z',
                    updatedAt: '2020-05-19T11:18:52.492Z',
                    districtId: 24,
                    isHub: true,
                    hubId: null,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 27,
                    businessId: 2,
                    name: 'Rollback',
                    address: 'Test Rollback',
                    city: 'Rollback',
                    state: 'Alaska',
                    zipCode: '12311',
                    phoneNumber: '234124321',
                    createdAt: '2020-05-19T19:44:05.992Z',
                    updatedAt: '2020-05-19T19:44:05.992Z',
                    districtId: 24,
                    isHub: true,
                    hubId: null,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  }
                ]
              }
            ]
          },
          {
            id: 19,
            businessId: 2,
            name: 'Region1',
            isDeleted: false,
            createdAt: '2020-05-20T15:03:55.751Z',
            updatedAt: '2020-05-20T15:03:55.751Z',
            districts: [
              {
                id: 25,
                regionId: 19,
                name: 'Region1',
                isDeleted: false,
                createdAt: '2020-05-20T15:03:55.751Z',
                updatedAt: '2020-05-20T15:03:55.751Z',
                stores: [
                  {
                    id: 33,
                    businessId: 2,
                    name: 'Bret Harte',
                    address: '196 Bret Harte',
                    city: 'San Braepur ',
                    state: 'California',
                    zipCode: '94999',
                    phoneNumber: '5658843333',
                    createdAt: '2020-05-31T17:25:51.606Z',
                    updatedAt: '2020-05-31T17:25:51.606Z',
                    districtId: 25,
                    isHub: false,
                    hubId: 32,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 38,
                    businessId: 2,
                    name: 'test location two',
                    address: 'test location two',
                    city: 'test city',
                    state: 'West Virginia',
                    zipCode: '02883',
                    phoneNumber: '37873',
                    createdAt: '2020-06-01T06:53:56.729Z',
                    updatedAt: '2020-06-01T06:53:56.729Z',
                    districtId: 25,
                    isHub: false,
                    hubId: 32,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: false
                  }
                ]
              }
            ]
          },
          {
            id: 20,
            businessId: 2,
            name: 'Region2',
            isDeleted: false,
            createdAt: '2020-05-20T15:04:53.153Z',
            updatedAt: '2020-05-20T15:04:53.153Z',
            districts: [
              {
                id: 26,
                regionId: 20,
                name: 'Region2',
                isDeleted: false,
                createdAt: '2020-05-20T15:04:53.153Z',
                updatedAt: '2020-05-20T15:04:53.153Z',
                stores: [
                  {
                    id: 35,
                    businessId: 2,
                    name: 'Testing 123',
                    address: 'testing',
                    city: 'testing',
                    state: 'American Samoa',
                    zipCode: '94123',
                    phoneNumber: '4158472933',
                    createdAt: '2020-05-31T18:02:53.401Z',
                    updatedAt: '2020-05-31T18:02:53.401Z',
                    districtId: 26,
                    isHub: false,
                    hubId: null,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: false
                  },
                  {
                    id: 34,
                    businessId: 2,
                    name: 'Falcon Dragon',
                    address: 'Space X',
                    city: 'Hawthorne',
                    state: 'California',
                    zipCode: '94123',
                    phoneNumber: '4158472933',
                    createdAt: '2020-05-31T17:53:36.333Z',
                    updatedAt: '2020-05-31T17:53:36.333Z',
                    districtId: 26,
                    isHub: false,
                    hubId: null,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 32,
                    businessId: 2,
                    name: 'new location',
                    address: 'address',
                    city: 'test city',
                    state: 'Wyoming',
                    zipCode: '93038',
                    phoneNumber: '3789',
                    createdAt: '2020-05-29T06:17:47.292Z',
                    updatedAt: '2020-05-29T06:17:47.292Z',
                    districtId: 26,
                    isHub: true,
                    hubId: null,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  }
                ]
              }
            ]
          },
          {
            id: 4,
            businessId: 2,
            name: 'Region',
            isDeleted: false,
            createdAt: '2020-03-27T17:09:17.453Z',
            updatedAt: '2020-03-27T17:09:17.453Z',
            districts: [
              {
                id: 4,
                regionId: 4,
                name: 'District',
                isDeleted: false,
                createdAt: '2020-03-27T17:09:17.453Z',
                updatedAt: '2020-03-27T17:09:17.453Z',
                stores: [
                  {
                    id: 24,
                    businessId: 2,
                    name: 'Big B Laundromat',
                    address: '805 Columbus Ave',
                    city: 'San Francisco',
                    state: 'California',
                    zipCode: '94133',
                    phoneNumber: '123034932241',
                    createdAt: '2020-04-24T05:12:26.311Z',
                    updatedAt: '2020-04-24T05:12:26.311Z',
                    districtId: 4,
                    isHub: false,
                    hubId: 20,
                    stripeLocationId: 'tml_Dp84Hw1zi660Yn',
                    password: '$argon2i$v=19$m=4096,t=3,p=1$RIMerQ8+EmcXxX6Pdr7j8Q$nQK+XCbXZhWZC8Jddgwl80C/pXjtv+gSPLedFQo+B9E',
                    stripeTerminalId: 'tmr_Dp84ygAvDKFAAm',
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 20,
                    businessId: 2,
                    name: 'Hub',
                    address: 'Hub Address',
                    city: 'City',
                    state: 'Alaska',
                    zipCode: '12313',
                    phoneNumber: '1242515213',
                    createdAt: '2020-04-03T11:44:45.763Z',
                    updatedAt: '2020-04-03T11:44:45.763Z',
                    districtId: 4,
                    isHub: true,
                    hubId: null,
                    stripeLocationId: null,
                    password: '$argon2i$v=19$m=4096,t=3,p=1$RIMerQ8+EmcXxX6Pdr7j8Q$nQK+XCbXZhWZC8Jddgwl80C/pXjtv+gSPLedFQo+B9E',
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 12,
                    businessId: 2,
                    name: 'Second Store',
                    address: 'Second Address',
                    city: 'City',
                    state: 'Alabama',
                    zipCode: '12314',
                    phoneNumber: '123034932241',
                    createdAt: '2020-03-31T09:18:24.310Z',
                    updatedAt: '2020-03-31T09:18:24.310Z',
                    districtId: 4,
                    isHub: false,
                    hubId: 20,
                    stripeLocationId: 'tml_Dp84Hw1zi660Yn',
                    password: '$argon2i$v=19$m=4096,t=3,p=1$RIMerQ8+EmcXxX6Pdr7j8Q$nQK+XCbXZhWZC8Jddgwl80C/pXjtv+gSPLedFQo+B9E',
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 14,
                    businessId: 2,
                    name: 'Stand Alone Store',
                    address: 'Stand Alone Store',
                    city: 'sfasknfasl',
                    state: 'Arizona',
                    zipCode: '12132',
                    phoneNumber: '2134124321',
                    createdAt: '2020-04-01T10:03:37.130Z',
                    updatedAt: '2020-04-01T10:03:37.130Z',
                    districtId: 4,
                    isHub: false,
                    hubId: 32,
                    stripeLocationId: null,
                    password: '$argon2i$v=19$m=4096,t=3,p=1$RIMerQ8+EmcXxX6Pdr7j8Q$nQK+XCbXZhWZC8Jddgwl80C/pXjtv+gSPLedFQo+B9E',
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 37,
                    businessId: 2,
                    name: 'test location one',
                    address: 'test location one',
                    city: 'City',
                    state: 'Northern Mariana Islands',
                    zipCode: '38882',
                    phoneNumber: '37788',
                    createdAt: '2020-06-01T06:48:16.195Z',
                    updatedAt: '2020-06-01T06:48:16.195Z',
                    districtId: 4,
                    isHub: false,
                    hubId: 32,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: false
                  },
                  {
                    id: 1,
                    businessId: 2,
                    name: 'Store',
                    address: 'Store Address',
                    city: 'City1',
                    state: 'Alaska',
                    zipCode: '12343',
                    phoneNumber: '0989874567',
                    createdAt: '2020-03-27T15:10:26.516Z',
                    updatedAt: '2020-03-27T15:10:26.516Z',
                    districtId: 4,
                    isHub: false,
                    hubId: 20,
                    stripeLocationId: 'tml_Dp84Hw1zi660Yn',
                    password: '$argon2i$v=19$m=4096,t=3,p=1$RIMerQ8+EmcXxX6Pdr7j8Q$nQK+XCbXZhWZC8Jddgwl80C/pXjtv+gSPLedFQo+B9E',
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  },
                  {
                    id: 36,
                    businessId: 2,
                    name: 'test location',
                    address: 'test address',
                    city: 'test city',
                    state: 'North Dakota',
                    zipCode: '80303',
                    phoneNumber: '1234',
                    createdAt: '2020-06-01T06:42:59.990Z',
                    updatedAt: '2020-06-01T06:42:59.990Z',
                    districtId: 4,
                    isHub: false,
                    hubId: 32,
                    stripeLocationId: null,
                    password: null,
                    stripeTerminalId: null,
                    hasReceiptPrinter: false,
                    dcaLicense: null,
                    offersFullService: true
                  }
                ]
              }
            ]
          }
        ],
        regionsCallInProgress: false,
        locationsWithOutHub: [],
        regionsWithOutHub: [
          {
            id: 18,
            businessId: 2,
            name: 'name',
            isDeleted: false,
            createdAt: '2020-05-19T11:13:43.277Z',
            updatedAt: '2020-05-19T11:13:43.277Z',
            districts: [
              {
                id: 24,
                regionId: 18,
                name: 'name',
                isDeleted: false,
                createdAt: '2020-05-19T11:13:43.277Z',
                updatedAt: '2020-05-19T11:13:43.277Z',
                stores: [
                  {
                    id: 31,
                    businessId: 2,
                    name: 'test location',
                    address: 'new jersey',
                    city: 'new jersey',
                    state: 'New Jersey',
                    zipCode: '28899',
                    phoneNumber: '9822',
                    districtId: 24,
                    isHub: false,
                    hubId: null,
                    stripeLocationId: null,
                    stripeTerminalId: null
                  }
                ]
              }
            ]
          },
          {
            id: 19,
            businessId: 2,
            name: 'Region1',
            isDeleted: false,
            createdAt: '2020-05-20T15:03:55.751Z',
            updatedAt: '2020-05-20T15:03:55.751Z',
            districts: [
              {
                id: 25,
                regionId: 19,
                name: 'Region1',
                isDeleted: false,
                createdAt: '2020-05-20T15:03:55.751Z',
                updatedAt: '2020-05-20T15:03:55.751Z',
                stores: []
              }
            ]
          },
          {
            id: 20,
            businessId: 2,
            name: 'Region2',
            isDeleted: false,
            createdAt: '2020-05-20T15:04:53.153Z',
            updatedAt: '2020-05-20T15:04:53.153Z',
            districts: [
              {
                id: 26,
                regionId: 20,
                name: 'Region2',
                isDeleted: false,
                createdAt: '2020-05-20T15:04:53.153Z',
                updatedAt: '2020-05-20T15:04:53.153Z',
                stores: [
                  {
                    id: 35,
                    businessId: 2,
                    name: 'Testing 123',
                    address: 'testing',
                    city: 'testing',
                    state: 'American Samoa',
                    zipCode: '94123',
                    phoneNumber: '4158472933',
                    districtId: 26,
                    isHub: false,
                    hubId: null,
                    stripeLocationId: null,
                    stripeTerminalId: null
                  },
                  {
                    id: 34,
                    businessId: 2,
                    name: 'Falcon Dragon',
                    address: 'Space X',
                    city: 'Hawthorne',
                    state: 'California',
                    zipCode: '94123',
                    phoneNumber: '4158472933',
                    districtId: 26,
                    isHub: false,
                    hubId: null,
                    stripeLocationId: null,
                    stripeTerminalId: null
                  }
                ]
              }
            ]
          },
          {
            id: 4,
            businessId: 2,
            name: 'Region',
            isDeleted: false,
            createdAt: '2020-03-27T17:09:17.453Z',
            updatedAt: '2020-03-27T17:09:17.453Z',
            districts: [
              {
                id: 4,
                regionId: 4,
                name: 'District',
                isDeleted: false,
                createdAt: '2020-03-27T17:09:17.453Z',
                updatedAt: '2020-03-27T17:09:17.453Z',
                stores: []
              }
            ]
          }
        ],
        isWithOutHubCallInProgress: false,
        showServicePricesScreen: true,
        showProductPricesScreen: false,
        servicesError: '',
        isServiceCallInProgress: false,
        activeLocationServices: [
          {
            id: 4,
            category: 'PER_POUND',
            services: [
              {
                id: 33,
                serviceCategoryId: 4,
                name: 'Service Per lb',
                defaultPrice: 5,
                hasMinPrice: false,
                description: 'description',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1179,
                    storeId: 1,
                    serviceId: 33,
                    storePrice: 5,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 17,
                serviceCategoryId: 4,
                name: 'Test small',
                defaultPrice: 10,
                hasMinPrice: true,
                description: 'Description',
                minPrice: 2,
                minQty: 20,
                prices: [
                  {
                    id: 998,
                    storeId: 1,
                    serviceId: 17,
                    storePrice: 0,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 25,
                serviceCategoryId: 4,
                name: 'medium',
                defaultPrice: 90,
                hasMinPrice: false,
                description: 'desc',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 999,
                    storeId: 1,
                    serviceId: 25,
                    storePrice: 88.78,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 29,
                serviceCategoryId: 4,
                name: 'test service one',
                defaultPrice: 20,
                hasMinPrice: false,
                description: 'desc',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1000,
                    storeId: 1,
                    serviceId: 29,
                    storePrice: 50,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 21,
                serviceCategoryId: 4,
                name: 'Wash Medium',
                defaultPrice: 1.2,
                hasMinPrice: true,
                description: 'Description goes here',
                minPrice: 6,
                minQty: 1.12,
                prices: [
                  {
                    id: 1002,
                    storeId: 1,
                    serviceId: 21,
                    storePrice: 1.2,
                    minQty: 1.12,
                    minPrice: 6,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 28,
                serviceCategoryId: 4,
                name: 'medium service',
                defaultPrice: 50,
                hasMinPrice: true,
                description: 'Description',
                minPrice: 10,
                minQty: 20,
                prices: [
                  {
                    id: 1003,
                    storeId: 1,
                    serviceId: 28,
                    storePrice: 50,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 18,
                serviceCategoryId: 4,
                name: 'test medium',
                defaultPrice: 30,
                hasMinPrice: true,
                description: 'Description',
                minPrice: 5,
                minQty: 10,
                prices: [
                  {
                    id: 1004,
                    storeId: 1,
                    serviceId: 18,
                    storePrice: 0,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 16,
                serviceCategoryId: 4,
                name: 'Dash and Gold',
                defaultPrice: 1.5,
                hasMinPrice: false,
                description: 'No description',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1005,
                    storeId: 1,
                    serviceId: 16,
                    storePrice: 11.5,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 23,
                serviceCategoryId: 4,
                name: 'small',
                defaultPrice: 0,
                hasMinPrice: true,
                description: 'desc',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1100,
                    storeId: 1,
                    serviceId: 23,
                    storePrice: 0,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 32,
                serviceCategoryId: 4,
                name: 'Test Defult Price Service',
                defaultPrice: 2,
                hasMinPrice: true,
                description: 'test',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1148,
                    storeId: 1,
                    serviceId: 32,
                    storePrice: 2,
                    minQty: null,
                    minPrice: 7,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 30,
                serviceCategoryId: 4,
                name: 'SUPREME DELUX',
                defaultPrice: 1.99,
                hasMinPrice: true,
                description: 'Super delux',
                minPrice: 10,
                minQty: 10,
                prices: [
                  {
                    id: 994,
                    storeId: 1,
                    serviceId: 30,
                    storePrice: 1.99,
                    minQty: 10,
                    minPrice: 10,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 24,
                serviceCategoryId: 4,
                name: 'service',
                defaultPrice: 100,
                hasMinPrice: false,
                description: 'description',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 995,
                    storeId: 1,
                    serviceId: 24,
                    storePrice: 100,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 26,
                serviceCategoryId: 4,
                name: 'service two',
                defaultPrice: 10.7383,
                hasMinPrice: false,
                description: 'desc',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 996,
                    storeId: 1,
                    serviceId: 26,
                    storePrice: 10.7383,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 27,
                serviceCategoryId: 4,
                name: 'Wash and Fold',
                defaultPrice: 1.99,
                hasMinPrice: true,
                description: 'Just another service.',
                minPrice: 1,
                minQty: 1,
                prices: [
                  {
                    id: 997,
                    storeId: 1,
                    serviceId: 27,
                    storePrice: 1.99,
                    minQty: 1,
                    minPrice: 1,
                    isFeatured: true
                  }
                ]
              }
            ]
          },
          {
            id: 3,
            category: 'FIXED_PRICE',
            services: [
              {
                id: 20,
                serviceCategoryId: 3,
                name: 'test small',
                defaultPrice: 20,
                hasMinPrice: false,
                description: 'test',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1007,
                    storeId: 1,
                    serviceId: 20,
                    storePrice: 20,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 14,
                serviceCategoryId: 3,
                name: 'XL (51-75lbs) ',
                defaultPrice: 20,
                hasMinPrice: false,
                description: null,
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1008,
                    storeId: 1,
                    serviceId: 14,
                    storePrice: 20,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 11,
                serviceCategoryId: 3,
                name: 'Small (upto 20lbs)',
                defaultPrice: 6,
                hasMinPrice: false,
                description: null,
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1009,
                    storeId: 1,
                    serviceId: 11,
                    storePrice: 0,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 22,
                serviceCategoryId: 3,
                name: 'small',
                defaultPrice: 0,
                hasMinPrice: false,
                description: 'desc',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1010,
                    storeId: 1,
                    serviceId: 22,
                    storePrice: 0,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 13,
                serviceCategoryId: 3,
                name: 'Large (36-50lbs)',
                defaultPrice: 15,
                hasMinPrice: false,
                description: null,
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1011,
                    storeId: 1,
                    serviceId: 13,
                    storePrice: 15,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 19,
                serviceCategoryId: 3,
                name: 'test medium',
                defaultPrice: 35,
                hasMinPrice: false,
                description: 'test',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1012,
                    storeId: 1,
                    serviceId: 19,
                    storePrice: 0,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 31,
                serviceCategoryId: 3,
                name: 'Fixed Supreme',
                defaultPrice: 5.99,
                hasMinPrice: false,
                description: 'Fixed baby',
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1013,
                    storeId: 1,
                    serviceId: 31,
                    storePrice: 5.99,
                    minQty: null,
                    minPrice: null,
                    isFeatured: true
                  }
                ]
              },
              {
                id: 15,
                serviceCategoryId: 3,
                name: 'XXL (76-100lbs)',
                defaultPrice: 25,
                hasMinPrice: false,
                description: null,
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1014,
                    storeId: 1,
                    serviceId: 15,
                    storePrice: 25,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              },
              {
                id: 12,
                serviceCategoryId: 3,
                name: 'Medium (21-35lbs)',
                defaultPrice: 10,
                hasMinPrice: false,
                description: null,
                minPrice: null,
                minQty: null,
                prices: [
                  {
                    id: 1006,
                    storeId: 1,
                    serviceId: 12,
                    storePrice: 10,
                    minQty: null,
                    minPrice: null,
                    isFeatured: false
                  }
                ]
              }
            ]
          }
        ],
        productsError: '',
        isProductsCallInProgress: false,
        activeLocationProducts: [],
        isLocationDetailsLoading: false,
        locationDetailsError: '',
        refreshLocationDetails: false
      },
    }
  }
};
const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");

describe('Rendering Services and Products Tab', () => {

  it('Should render PricePerService if the active tab is PER_POUND', () => { 
    const store = mockStore(initState);
    const wrapper = mount(
      <BrowserRouter>
        <Provider store={store}>
            <ServicesAndProducts activeServicesAndProductsTab={servicesAndProductsTabValues.PER_POUND}/>
        </Provider>
      </BrowserRouter>
    );
    
    let test = wrapper.find('.products-and-services-content');
    expect(test.find(PricePerService).length).toBe(1);
  });

  it('Should render PricePerService if the active tab is FIXED_PRICE', () => { 
    const store = mockStore(initState);
    const wrapper = mount(
      <BrowserRouter>
        <Provider store={store}>
            <ServicesAndProducts activeServicesAndProductsTab={servicesAndProductsTabValues.FIXED_PRICE}/>
        </Provider>
      </BrowserRouter>
    );
    
    let test = wrapper.find('.products-and-services-content');
    expect(test.find(PricePerService).length).toBe(1);
  });

  it('Should render PricePerProduct if the active tab is PRODUCTS', () => { 
    const store = mockStore(initState);
    const wrapper = mount(
      <BrowserRouter>
        <Provider store={store}>
            <ServicesAndProducts activeServicesAndProductsTab={servicesAndProductsTabValues.PRODUCTS}/>
        </Provider>
      </BrowserRouter>
    );
    
    let test = wrapper.find('.products-and-services-content');
    expect(test.find(PricePerProduct).length).toBe(1);
  });
})


describe('Reducers in Services and Products tab', () => {

  const store = mockStore({});
  beforeEach(() => {
    store.clearActions();
  });

  it('Should set active tab in location state', () => {
    let action = {
      type: BoLocationsNamespacer(locationsAT.SET_SERVICES_AND_PRODUCTS_ACTIVE_TAB),
      payload: 'test_tab',
    };

    expect(locationsReducer(undefined, action).activeServicesAndProductsTab).toEqual('test_tab');
  })
})