module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
        right_client_key: 'witdomCA/client1_key.pem',
        right_client_cert: 'witdomCA/client1_crt.pem',
        wrong_client_key: 'untrustedCA/untrusted_client_key.pem',
        wrong_client_cert: 'untrustedCA/untrusted_client_crt.pem',
        ca_cert: 'witdomCA/witdomcacert.pem'
    }
};