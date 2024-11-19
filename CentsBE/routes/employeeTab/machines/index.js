const router = require('express').Router();

const turns = require('./turns');
const devices = require('./devices');
const addMachine = require('../../businessOwner/machine/addMachine');
const validateMachineName = require('../../businessOwner/machine/validateMachineName');

const { listMachines } = require('../../businessOwner/machine/getMachinesList');
const { machineDetails } = require('../../businessOwner/machine/getMachineDetails');
const updateMachineDetails = require('../../businessOwner/machine/updateMachineDetails');
const getTurnsList = require('../../businessOwner/machine/getTurnsList');
const { createTurn } = require('../../businessOwner/machine/turns/create');
const { unpairing } = require('../../businessOwner/machine/pairing');
const machineList = require('./machineList');
const machineModel = require('../../businessOwner/machine/machineModel');
const { machineStats } = require('../../businessOwner/machine/getMachineStats');
const machinePairing = require('../../businessOwner/machine/pairing');

// validations
const addMachineValidation = require('../../../validations/machines/addMachine');
const machineNameValidator = require('../../../validations/machines/validateMachineName');
const machineListValidator = require('../../../validations/machines/machinesListValidation');
const getMachineDetailsValidator = require('../../../validations/machines/getMachineDetailsValidation');
const updateMachineDetailsValidator = require('../../../validations/machines/updateMachineDetails');
const getTurnListValidation = require('../../../validations/machines/turns/getTurnList');
const getAvailableMachineList = require('../../../validations/machines/getAvailableMachines');
const createTurnValidation = require('../../../validations/machines/turns/createTurnValidation');
const machineStatsValidation = require('../../../validations/machines/machineStatsValidation');
const pairingValidations = require('../../../validations/machineDbValidations/pairing');
const getUnpairDeviceValidation = require('../../../validations/machines/unpairDevice');

router.use('/turns', turns);
router.use('/devices', devices);
router.get('/machinemodel', machineModel);
router.post('/', addMachineValidation, addMachine);
router.post('/validate-name', machineNameValidator, validateMachineName);
router.get('/', machineListValidator, listMachines);
router.get('/stats', machineStatsValidation, machineStats);
router.get('/:id', getMachineDetailsValidator, machineDetails);
router.put('/:machineId', updateMachineDetailsValidator, updateMachineDetails);
router.get('/:machineId/turns', getTurnListValidation, getTurnsList);
router.post('/:id/turn', createTurnValidation, createTurn);
router.get('/:storeId/available-machines', getAvailableMachineList, machineList);
router.post('/:machineId/pair', pairingValidations, machinePairing.pairing);
router.post('/:machineId/un-pair', getUnpairDeviceValidation.unpairDeviceValidation, unpairing);

module.exports = router;
