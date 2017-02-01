module.exports = {
    http: { port: 5100 },
    https: {
        port: 5143,
        broker_key: 'certs/broker_ud_key.pem',
        broker_key_passphrase: 'W1td0mBr0k3r',
        broker_cert: 'certs/broker_ud_crt.pem',
        ca_cert: 'certs/witdomcacert.pem'
    },
    //protocol: "http",
    protocol: "https",
    database: {
        host: 'localhost',
        port: '27018'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                service_ud: {
                    host: "10.5.1.120",
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
        endpoint: "http://10.10.43.20:5001/v3"
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