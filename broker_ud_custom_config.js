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
    broker_ed : { //broker external domain
        domain_name: "broker-td",
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
};
