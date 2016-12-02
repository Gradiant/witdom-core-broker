module.exports = {
    //tokenValidationModule: __base + "validators/dummyTokenValidation"
    /*orchestrator: {
        name: 'cloudify_provider_connector',
        config: {
            protocol: 'http',
            host: 'localhost',
            port: '1234',
            auth_token: 'some token',
            certificate_key: './CAs/witdomCA/client1_key.pem',
            certificate: './CAs/witdomCA/client1_crt.pem',
            ca: './CAs/witdomCA/witdomcacert.pem'
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
    }
};