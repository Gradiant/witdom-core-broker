module.exports = {
    protocol: "http",
    http: { port: 5100 },
    https: {
        port: 5143,
        broker_key: 'certs/broker_ud_key.pem',
        broker_key_passphrase: 'Gr4d14ntBr0k3r',
        broker_cert: 'certs/broker_ud_crt.pem',
        //ca_cert: 'certs/udcacert.pem'
        ca_certs: ['certs/udcacert.pem', 'certs/tdcacert.pem']
    },
    database: {
        host: 'localhost',
        port: '27018'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                "untrusted-service": {
                    host: "localhost",
                    port: "8082"
                }
            }
        }
    },
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://localhost:5001/v3"
    },
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
    }
};