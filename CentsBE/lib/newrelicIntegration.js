if (process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY) {
    // Newrelic to be only used for remote server.
    // eslint-disable-next-line global-require
    require('newrelic');
}
