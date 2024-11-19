const { getLocationString } = require("../../utils/businessOwnerUtils")


const allLocations = [
  {
    id: 1,
    name: 'Berkeley Hearst',
    city: 'Berkeley',
    address: 'Hearst Avenue',
    totalRecords: '23'
  },
  {
    id: 2,
    name: 'Berkeley Shatak ',
    city: 'Berkeley CA',
    address: 'Shatak Avenue',
    totalRecords: '23'
  },
  {
    id: 14,
    name: 'Daly City',
    city: 'SF',
    address: 'Daly City Bart ',
    totalRecords: '23'
  },
  {
    id: 33,
    name: 'test loc',
    city: 'Hyd',
    address: 'test loc',
    totalRecords: '23'
  },
  {
    id: 34,
    name: 'Dwinelle Hall',
    city: 'Berkeley',
    address: 'Dwinelle Hall',
    totalRecords: '23'
  },
  {
    id: 50,
    name: 'toggle test',
    city: 'Bengaluru',
    address: 'toggle test',
    totalRecords: '23'
  },
  {
    id: 51,
    name: 'Test loc',
    city: 'HYD',
    address: 'test loc',
    totalRecords: '23'
  },
  {
    id: 53,
    name: 'Test-bug',
    city: '6666HYD',
    address: 'BugFix-Test',
    totalRecords: '23'
  },
  {
    id: 55,
    name: 'Clean Rite Test',
    city: 'Brooklyn',
    address: '3251 Gough Street',
    totalRecords: '23'
  },
  {
    id: 56,
    name: 'Test Hub',
    city: 'Brooklyn',
    address: 'Hub Tracking Test',
    totalRecords: '23'
  },
  {
    id: 68,
    name: 'Hearst ',
    city: 'Test',
    address: 'Hearst Avenue',
    totalRecords: '23'
  },
  {
    id: 69,
    name: 'test Name',
    city: 'test City',
    address: 'test Address',
    totalRecords: '23'
  },
  {
    id: 70,
    name: 'test2',
    city: 'xyz',
    address: 'test add2',
    totalRecords: '23'
  },
  {
    id: 71,
    name: 'Hearst',
    city: 'machigan',
    address: 'Address',
    totalRecords: '23'
  },
  {
    id: 72,
    name: 'xyz',
    city: 'city',
    address: 'Test Add',
    totalRecords: '23'
  },
  {
    id: 73,
    name: 'name1',
    city: 'city1',
    address: 'address1',
    totalRecords: '23'
  },
  {
    id: 77,
    name: 'Berkeley',
    city: 'dallas',
    address: 'berkeley Avenue',
    totalRecords: '23'
  },
  {
    id: 78,
    name: 'Arizona Avenue',
    city: 'machigan ',
    address: 'AA Avenue',
    totalRecords: '23'
  },
  {
    id: 79,
    name: 'Brat Avenue',
    city: 'commerce',
    address: 'Brart street',
    totalRecords: '23'
  },
  {
    id: 80,
    name: 'Name2',
    city: 'City2',
    address: 'Address2',
    totalRecords: '23'
  },
  {
    id: 81,
    name: 'Info ',
    city: 'Info city',
    address: 'Info Address',
    totalRecords: '23'
  },
  {
    id: 82,
    name: 'Gough Store',
    city: '11111',
    address: 'Gough Venue',
    totalRecords: '23'
  },
  {
    id: 83,
    name: 'xyz',
    city: 'City2',
    address: 'Venue street',
    totalRecords: '23'
  }
]

describe('BO utils - getLocationString', () => {
  it('Should return all locations', () => {
    const selectedLocations = allLocations.map( loc => loc.id);
    expect(getLocationString(selectedLocations, allLocations)).toBe('all locations');
  });

  it('Should return <number> of locations', () => {
    const selectedLocations = allLocations.map( loc => loc.id).slice(0, 4);
    expect(getLocationString(selectedLocations, allLocations)).toBe(`${selectedLocations.length} locations`);
  });

  it('Should return location address', () => {
    const selectedLocations = allLocations.map( loc => loc.id).slice(0, 1);
    expect(getLocationString(selectedLocations, allLocations)).toBe(`${allLocations.find(loc => loc.id === selectedLocations[0]).address}`);
  });

  it('Should return empty string', () => {
    expect(getLocationString(null, allLocations)).toBe('');
    expect(getLocationString([], allLocations)).toBe('');
  });
})