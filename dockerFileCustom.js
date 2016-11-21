module.exports = {
    //tokenValidationModule: __base + "validators/dummyTokenValidation"
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://iam:5000/v3"
    },
};
