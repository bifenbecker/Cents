const ld = require('launchdarkly-node-server-sdk');

/**
 * This class represents the LaunchDarkly singleton, which allows us to
 * maintain and manager internal state and serve feature flags without making any
 * remote requests
 */
class LaunchDarkly {
    constructor() {
        if (process.env.LAUNCHDARKLY_KEY) {
            this.client = ld.init(process.env.LAUNCHDARKLY_KEY);
        }
        this.user = {
            key: 'developer@trycents.com',
        };
    }

    /**
     * Retrieve the LD Singleton instance
     */
    getInstance() {
        if (!this.client) {
            this.client = new LaunchDarkly();
        }
        return this.client;
    }

    /**
     * Retrieve a list of all flags for the BE
     *
     * @param {Object} userInfo
     */
    async getAllFlags(userInfo = this.user) {
        const flags = await this.client.allFlagsState(userInfo, null);
        return flags;
    }

    /**
     * Evaluate whether a flag is available or note
     *
     * @param {String} flagKey
     * @param {Object} user
     */
    async evaluateFlag(flagKey, userInfo = this.user) {
        if (!this.client) {
            return false;
        }
        const result = await this.client.variation(flagKey, userInfo);
        return result;
    }
}

module.exports = new LaunchDarkly();
