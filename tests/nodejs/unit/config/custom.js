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
        endpoint: "http://172.16.118.243:5001/v3"
    }
};