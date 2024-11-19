require('dotenv').config();

const jwt = require('jsonwebtoken');
const fs = require('fs');

(async function generateOrderToken() {
    try {
        const token = await jwt.sign({ id: 9042 }, process.env.JWT_SECRET_TOKEN_ORDER);
        fs.writeFile('tokens.txt', token, (err) => {
            if (err) throw err;
        });
    } catch (error) {
        throw Error(error);
    }
})();
