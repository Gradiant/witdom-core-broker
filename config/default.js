module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_key.pem',
        broker_key_passphrase: 'W1td0mBr0k3r',
        broker_cert: 'certs/broker_crt.pem',
        ca_cert: 'certs/witdomcacert.pem'
    },
    database: {
        host: 'mongo',
        port: '27017'
    }
};