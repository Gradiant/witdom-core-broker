var should = require("should");
global.__base =  __dirname + '/../../../'; //Save the broker base directory
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
var winston = require('winston');
global.__logger = new winston.Logger({
    level: 'info',
    transports: [
//      new (winston.transports.Console)()
    ]
});

var restCaller = require(__base + 'request/rest').Rest;

restCaller.init({timeout: 5000});

var RestHandler = require(__base + 'request_forwarding/rest');

describe("RestCaller: ", function() {
    describe("request: ", function() {
        it("GET google: ", function(done) {
            RestHandler.request({
                details: {
                    service_id: "google_http",
                    description: "Google search",
                    uri: "www.google.com:80",
                    image: "image"
                }
            },{
                request: {
                    service_name: 'google_http',
                    service_path: '/',
                    method: 'GET',
                    headers: {
                        "content-type": "application/json",
                        "accept": "application/json"
                    },
                    body: null
                }
            },"fakeid", function(error, response) {
                //console.log(response.status);
                should.not.exist(error);
                should.exist(response);
                response.status.should.equal(200);
                done();
            });

        });

        it("GET google logo: ", function(done) {
            RestHandler.request({
                details: {
                    service_id: "google_http",
                    description: "Google search",
                    uri: "www.google.com:80",
                    image: "image"
                }
            },{
                request: {
                    service_name: 'google_http',
                    service_path: '/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                    method: 'GET',
                    headers: {
                        //"accept": "application/json"
                    },
                    body: null
                }
            }, "fakeid", function(error, response) {
                should.not.exist(error);
                should.exist(response);
                response.status.should.equal(200);
                done();
            });
        });

        it("POST wrong JSON: ", function(done) {
            RestHandler.request({
                details: {
                    service_id: "google_http",
                    description: "Google search",
                    uri: "www.google.com:80",
                    image: "image"
                }
            },{
                request: {
                    service_name: 'google_http',
                    service_path: '/',
                    method: 'POST',
                    headers: {
                        "content-type": "application/json",
                        "accept": "application/json"
                    },
                    body: "ABC"
                }
            }, "fakeid", function(error, response) {
                should.not.exist(error);
                should.exist(response);
                //response.status.should.equal(200);
                done();
            });

        });

    });

    describe("forwardRequest: ", function() {

    });
});