module.exports = {
    //tokenValidationModule: __base + "validators/dummyTokenValidation"
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_ud_key.pem',
        broker_key_passphrase: 'Gr4d14ntBr0k3r',
        broker_cert: 'certs/broker_ud_crt.pem',
        //ca_cert: 'certs/udcacert.pem'
        ca_certs: ['certs/udcacert.pem', 'certs/tdcacert.pem']
    },
    protocol: "http",
    broker_ed : { //broker external domain
        domain_name: "broker-td",
        http: {
            port: 5000
        },
        https: {
            port: 5043
        },
        http_port: 5000,
        https_port: 5043
    },
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://iam:5000/v3"
    },
    database: {
        host: 'mongo2',
        port: '27017'
    },
    /*orchestrator: {
        name: 'cloudify_provider_connector',
         config: {
            protocol: 'http',
            host: 'cloudify',
            port: '80'
        }
    },*/
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                service2: {
                    host: "127.0.0.1", //"172.16.117.31",
                    port: "8080" 
                },
                "untrusted-service": {
                    host: "service-ud",
                    port: "8080"
                }
            }      
        }   
    }
};
