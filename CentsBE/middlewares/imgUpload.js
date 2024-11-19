const multer = require('multer');
const uuidv4 = require('uuid/v4');

const storage = multer.diskStorage({
    destination: (req, file, done) => {
        done(null, './public/img/uploads');
    },
    filename: (req, file, done) => {
        const fileName = uuidv4();
        done(null, `${fileName}-${file.originalname}`);
    },
});

const upload = multer({ storage });

module.exports = exports = upload;
