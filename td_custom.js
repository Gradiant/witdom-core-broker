module.exports = {
    //protocol: "http",
    protocol: "http",
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_td_key.pem',
        broker_key_passphrase: 'W1td0mBr0k3r',
        broker_cert: 'certs/broker_td_crt.pem',
        ca_cert: 'certs/witdomcacert.pem'
    },
    database: {
        host: 'localhost',
        port: '27017'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                service1: {                    
                    host: "127.0.0.1",           
                    port: "8081"               
                },
                google: {
                    host: "www.google.com",
                    port: "80" 
                },
                po: {
                    host: "localhost",
                    port: "8080"
                },
                service_td: {
                    host: "localhost",
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
        endpoint: "http://localhost:5001/v3"
    },
    broker_ed : { //broker external domain
        domain_name: "broker-ud",
        http: {
            port: 5100
        },
        https: {
            port: 5143
        },
        http_port: 5100,
        https_port: 5143
    }
};