// Create and export donfiguratin variables

// Container for all the environments
let environments = {};

// Staging (default) environment

environments.staging = {
    'port' : 3000,
    'envName': 'staging'
};

environments.production = {
    'port' : 5000,
    'envName' : 'production'
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ""

const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;