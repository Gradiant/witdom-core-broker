module.exports = {
    http: {
        host: "localhost", 
        port: 5000
     },
    https: {
        host: "broker-td",
        port: 5043,
        right_client_key: 'CAs/tdCA/client_td_key.pem',
        right_client_cert: 'CAs/tdCA/client_td_crt.pem',
        wrong_client_key: 'CAs/untrustedCA/untrusted_client_key.pem',
        wrong_client_cert: 'CAs/untrustedCA/untrusted_client_crt.pem',
        ca_cert: 'CAs/tdCA/tdcacert.pem'
    }
};