
module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_td_key.pem',
        broker_key_passphrase: 'W1td0mBr0k3r',
        broker_cert: 'certs/broker_td_crt.pem',
        ca_cert: 'certs/witdomcacert.pem'
    },
    protocol: "http",
    broker_ed : { //broker external domain
        domain_name: "broker-ud",
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
        host: 'localhost',
        port: '27017'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {po:{host:"po",port:"8080"}, "trusted-service":{host:"trusted-service",port:"8080"}}
        }   
    }
};


