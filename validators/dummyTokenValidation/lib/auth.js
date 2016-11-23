function dummyTokenValidation(endpoint, adminUser, adminPass)
{
}

dummyTokenValidation.prototype.validateAuthenticationToken = function(tokenToValidate, fn) {
    fn(null, true, "dummy");
}

module.exports = dummyTokenValidation;