// This module is dummy token validator to serve as en example of how to
// create a new module to connect to a different service for validate tokens
// The module doesn't connect to any service, it just validates all The
// tokens and returns 'dummy' as the token user 


var dummyTokenValidation = require('./lib/auth');

module.exports = {
  TokenValidationService: dummyTokenValidation
}