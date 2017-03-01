module.exports = {
    //tokenValidationModule: __base + "validators/dummyTokenValidation"
    /*orchestrator: {
        name: 'cloudify_provider_connector',
        config: {
            protocol: 'http',
            host: 'localhost',
            port: '1234'
        }
    }*/
    protocol: "http",
    database: {
        host: 'localhost',
        port: '27017'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                po: {
                    host: "10.5.1.120",
                    port: "8080"
                },
                service_td: {
                    host: "10.5.1.120",
                    port: "8081"
                }
            }
        }
    },
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://10.10.43.20:5001/v3"
    }
};