const router = require('express').Router();

// Controllers
const {
    getAllUsers,
    createNewUser,
    getAllBusinessOwners,
    getIndividualUser,
    updateUserPassword,
    searchUsers,
    updateIndividualValueForUser,
    assignUserToBusiness,
    editEmployeeCode,
} = require('./usersController');

// Validations
const newUserValidation = require('../../../validations/superAdmin/users/createNewUser');
const newPasswordValidation = require('../../../validations/superAdmin/utils/createNewPassword');
const updateUserValidation = require('../../../validations/superAdmin/users/updateUser');
const assignBusinessValidation = require('../../../validations/superAdmin/users/assignUserToNewBusiness');
const editEmmployeeCodeValidation = require('../../../validations/superAdmin/users/editEmployeeCode');

router.get('/all', getAllUsers);
router.get('/all/search', searchUsers);
router.post('/create', newUserValidation, createNewUser);
router.get('/business-owners', getAllBusinessOwners);
router.get('/:id', getIndividualUser);
router.put('/:id/password/save', newPasswordValidation, updateUserPassword);
router.put('/:id/update', updateUserValidation, updateIndividualValueForUser);
router.put('/:id/business/update', assignBusinessValidation, assignUserToBusiness);
router.put('/:id/employee-code/update', editEmmployeeCodeValidation, editEmployeeCode);

module.exports = exports = router;
