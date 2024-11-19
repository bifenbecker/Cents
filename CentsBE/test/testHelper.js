process.env.NODE_ENV = 'test';
process.env.ENV_NAME = 'test';

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
});
