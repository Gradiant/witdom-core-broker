function dummyTokenValidation(endpoint, adminUser, adminPass)
{
}

dummyTokenValidation.prototype.validateAuthenticationToken = function(tokenToValidate, fn) {
    if (tokenToValidate == "wrongToken") {
        fn(null, false);
    } else {
        fn(null, true);
    }
}

module.exports = dummyTokenValidation;