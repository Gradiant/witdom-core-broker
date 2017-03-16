module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_key.pem',
        broker_key_passphrase: 'Gr4d14ntBr0k3r',
        broker_cert: 'certs/broker_td_crt.pem',
        ca_cert: 'certs/tdcacert.pem'
    },
    protocol: "http",
    //protocol: "https",
    numberOfRetries: 0,
    po_id: 'po',
    po_basepath: '/v1',
    po_connector: './protection/po_connector',
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
    },
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://127.0.0.1:5001/v3"
    },
    tokenValidationModule: "openstack-token-utils",
    database: {
        host: '127.0.0.1',
        port: '27017'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                google_http: {
                    host: "www.google.com",
                    port: "80"
                },
                google_https: {
                    host: "www.google.com",
                    port: "443"
                },
                error_service: {
                    host: "errordomain",
                    port: "80"
                },
                working_service: {
                    host: "working-service",
                    port: "80"
                },
                po: {
                    host: "po",
                    port: "8080"
                }
            }
        }
    },
    serviceInfoModule : __base + "service_info/mockServiceInfo"
};