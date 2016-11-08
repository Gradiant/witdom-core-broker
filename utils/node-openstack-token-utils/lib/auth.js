var openstack_wrapper = require('openstack-wrapper');


function TokenValidationService(keystoneEndpoint, adminUser, adminPass)
{
    console.log("keystoneEndpoint: " + keystoneEndpoint);
    console.log("adminUser: " + adminUser);
    console.log("adminPass: " + adminPass);
    /* Keystone REST client instance */ 
    this.keystone = new openstack_wrapper.Keystone(keystoneEndpoint);
    
    this.adminUsername = adminUser;
    this.adminPassword = adminPass;
    
    /* Token of an entity with administrative privileges (broker) */
    this.adminToken = null;
}


/* Validates provided authentication token after administrative token is retrieved */
/* Currently administrative token is not reused -> we get a new one within each call of validateAuthenticationToken() */
TokenValidationService.prototype.validateAuthenticationToken = function(tokenToValidate, fn) {
    var self = this;
    var tokenValid = null;
    self.getAuthToken(self.adminUsername, self.adminPassword, function(error, token) {
        if (error) {
            //console.error("Error retrieving admin auth token");
            fn(error);
            return;
        }
        self.adminToken = token;  
        //console.log("Admin token", self.adminToken);
        self.keystone.checkToken(self.adminToken, tokenToValidate, function(error, body) {
            tokenValid =  body.token_valdation_result;
            var tokenUser;
            if (tokenValid) {
                tokenUser = body.token.user.name;
            }
            fn(null, tokenValid, token, tokenUser);
        });           
    });
};  

/* Gets authentication token based on username+password credentials */
TokenValidationService.prototype.getAuthToken = function(username, pw, fn) {
 this.keystone.getToken(username, pw, function(error, token) {
        if(error) {
            fn(error);
            return;
        }
        fn(null, token.token);  
    });   
};


module.exports = TokenValidationService;

