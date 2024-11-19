const router = require('express').Router();

// Controllers
const { getAllBagNoteTags } = require('./bagNoteTagController');

router.get('/all', getAllBagNoteTags);

module.exports = exports = router;
