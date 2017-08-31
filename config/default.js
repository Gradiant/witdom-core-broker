module.exports = {
    protocol: "https",
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_key.pem',
        broker_key_passphrase: 'Gr4d14ntBr0k3r',
        broker_cert: 'certs/broker_td_crt.pem',
        //ca_cert: 'certs/tdcacert.pem'
        ca_certs: ['certs/tdcacert.pem', 'certs/udcacert.pem']
    },
    testing: true,
    numberOfRetries: 10,
    po_id: 'po',
    po_cn: 'po', // Common Name of the PO expected to be received in its client certificate, used to skip the calls to PO when the PO is the service making calls to the untrusted domain 
    po_connector: './protection/po_connector',
    po_basepath: '/v1',
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
        host: 'mongo',
        port: '27017'
    },
    audit: {
        active: 'true',
        database: {
            host: 'mongo',
            port: '27017'
        }
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                google_http: {
                    host: "www.google.com",
                    port: "443"
                },
                google_https: {
                    host: "www.google.com",
                    port: "80"
                }
            }
        }
    },
    serviceInfoModule : __base + "service_info/ServiceInfo"
};