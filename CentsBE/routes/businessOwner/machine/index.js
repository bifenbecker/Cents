const router = require('express').Router();
const upload = require('../../../middlewares/csvUpload');

const devices = require('./devices');
const deviceMachineDetailsAndPrices = require('./deviceMachineDetailsAndPrices');
const createMachineByDevice = require('./createMachineByDevice');
const createNetworkedMachineByOffline = require('./createNetworkedMachineByOffline');
const { listMachines } = require('./getMachinesList');
const machineModel = require('./machineModel');
const machineLoad = require('./machineLoad');
const updatePricing = require('./updatePrices');
const addMachine = require('./addMachine');
const addOfflineMachine = require('./addOfflineMachine');
const validateMachineName = require('./validateMachineName');
const machinePairing = require('./pairing');
const updateMachineDetails = require('./updateMachineDetails');
const { machinesCSVUpload, pairMachinesAndDevices } = require('./machinesCSVUpload');

const turns = require('./turns');

const addMachineValidation = require('../../../validations/machines/addMachine');
const addOfflineMachineValidation = require('../../../validations/machines/addOfflineMachineValidation');
const start = require('./startMachine');
const startMachineValidations = require('../../../validations/machineDbValidations/start');
const generateQr = require('./generateQr');
const generateQrCodeValidations = require('../../../validations/machineDbValidations/qrCodeGeneration');
const { machineStats } = require('./getMachineStats');
const getTurnsList = require('./getTurnsList');
const getMachinePricesSettings = require('./getMachinePricesSettings');

const machineStatsValidation = require('../../../validations/machines/machineStatsValidation');
const unPairedOnlineDevicesListValidator = require('../../../validations/machines/unPairedOnlineDevicesList');
const { machineDetails } = require('./getMachineDetails');
const { createTurn } = require('./turns/create');
const { searchUser } = require('../customers/search');
const downloadStatusLogs = require('./getStatusReport');
const resetTurns = require('./resetTurns');
const resetCoins = require('./resetCoins');

// api validations
const updateMachineDetailsValidation = require('../../../validations/machines/updateMachineDetails');
const machinesListValidation = require('../../../validations/machines/machinesListValidation');
const getMachineDetailsValidation = require('../../../validations/machines/getMachineDetailsValidation');
const machineNameValidator = require('../../../validations/machines/validateMachineName');
const pairingValidations = require('../../../validations/machineDbValidations/pairing');
const createTurnValidation = require('../../../validations/machines/turns/createTurnValidation');
const csvFileValidation = require('../../../validations/machines/csvFileValidation');
const getTurnListValidation = require('../../../validations/machines/turns/getTurnList');
const getUnpairDeviceValidation = require('../../../validations/machines/unpairDevice');
const pageValidator = require('../../../validations/pageValidation');
const getDeviceMachineDetailsValidation = require('../../../validations/machines/getDeviceMachineDetailsValidation');
const createMachineByDeviceValidator = require('../../../validations/machines/createMachineByDeviceValidation');
const getMachinePricesSettingsValidation = require('../../../validations/machines/getMachinePricesSettingsValidation');
const createNetworkedMachineByOfflineValidation = require('../../../validations/machines/createNetworkedMachineByOfflineValidation');

router.get('/customers/search', pageValidator, searchUser);
router.put('/price', updatePricing);
router.get('/machineload', machineLoad);
router.get('/machinemodel', machineModel);
router.put('/:machineId', updateMachineDetailsValidation, updateMachineDetails);
router.get('/stats', machineStatsValidation, machineStats);
router.post('/start', startMachineValidations, start);
router.get('/devices', unPairedOnlineDevicesListValidator, devices);
router.get(
    '/devices/:deviceId/details-prices',
    getDeviceMachineDetailsValidation,
    deviceMachineDetailsAndPrices,
);
router.get('/devices', unPairedOnlineDevicesListValidator, devices);
router.post(
    '/devices/:deviceId/create-machine',
    createMachineByDeviceValidator,
    createMachineByDevice,
);
router.post(
    '/:machineId/create-networked',
    createNetworkedMachineByOfflineValidation,
    createNetworkedMachineByOffline,
);
router.get('/', machinesListValidation, listMachines);
router.post('/:machineId/pair', pairingValidations, machinePairing.pairing);
router.post(
    '/:machineId/un-pair',
    getUnpairDeviceValidation.unpairDeviceValidation,
    machinePairing.unpairing,
);
router.post('/', addMachineValidation, addMachine);
router.post('/offline', addOfflineMachineValidation, addOfflineMachine);
router.get('/qrCode', generateQrCodeValidations, generateQr);
router.get('/:id', getMachineDetailsValidation, machineDetails);
router.post('/validate-name', machineNameValidator, validateMachineName);
router.post('/:id/turn', createTurnValidation, createTurn);
router.get('/:machineId/turns', getTurnListValidation, getTurnsList);
router.get(
    '/:machineId/prices-settings',
    getMachinePricesSettingsValidation,
    getMachinePricesSettings,
);
router.use('/turns', turns);
router.post(
    '/csv-upload',
    upload.single('machinesPairing'),
    machinesCSVUpload,
    csvFileValidation,
    pairMachinesAndDevices,
);
router.get('/:id/connection-logs/reports', downloadStatusLogs);
router.post('/:id/reset-turns', resetTurns);
router.put('/:id/reset-coins', resetCoins);

module.exports = router;
