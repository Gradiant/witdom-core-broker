module.exports = {
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
    },
    broker_ed : { //broker external domain
        domain_name: "localhost",
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