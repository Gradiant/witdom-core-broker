module.exports = {
    //tokenValidationModule: __base + "validators/dummyTokenValidation"
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_ud_key.pem',
        broker_key_passphrase: 'W1td0mBr0k3r',
        broker_cert: 'certs/broker_ud_crt.pem',
        ca_cert: 'certs/witdomcacert.pem'
    },
    protocol: "http",
    broker_ed : { //broker external domain
        domain_name: "broker",
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
        endpoint: "http://iam:5001/v3"
    },
    /*orchestrator: {
        name: 'cloudify_provider_connector',
         config: {
            protocol: 'http',
            host: 'cloudify',
            port: '80',
            auth_token: 'some token',
            certificate_key: '../../CAs/witdomCA/client1_key.pem',
            certificate: '../../CAs/witdomCA/client1_crt.pem',
            ca: '../../CAs/witdomCA/witdomcacert.pem'
        }
    },*/
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                service2: {
                    host: "127.0.0.1", //"172.16.117.31",
                    port: "8080" 
                }      
            }      
        }   
    }
};
