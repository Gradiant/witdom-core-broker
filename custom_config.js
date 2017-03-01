
module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_td_key.pem',
        broker_key_passphrase: 'Gr4d14ntBr0k3r',
        broker_cert: 'certs/broker_td_crt.pem',
        //ca_cert: 'certs/tdcacert.pem'
        ca_certs: ['certs/tdcacert.pem']
    },
    numberOfRetries: 10,
    po_id: 'po',
    po_connector: './protection/po_connector',
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
        host: 'mongo',
        port: '27017'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {}
        }   
    },
    logging_level: 'silly'
};


