module.exports = {
    database: {
        host: 'localhost',
        port: '27017'
    },
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        //endpoint: "http://127.0.0.1:5001/v3"
        endpoint: "http://172.16.118.243:5001/v3"
    }
};