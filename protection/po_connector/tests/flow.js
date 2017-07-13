global.__base = __dirname + '/../../../'; //Save the broker base directory
global.__customConfigFile = __base + 'config/custom.js';
var brokerConfig = require(__base +'config');
global.__brokerConfig = brokerConfig;
var should = require("should");
var nock = require('nock');

var winston = require('winston');
global.__logger = new winston.Logger({
    //level: 'info',
    transports: [
    //  new (winston.transports.Console)()
    ]
});

//Set the serviceInfoModule to 'mockServiceInfo'
__brokerConfig.serviceInfoModule = __base + "service_info/mockServiceInfo";

var httpsOptions = {
    timeout: 4000
};

var restCaller = require(__base + 'request/rest').Rest;

restCaller.init(httpsOptions);

var ServiceInfo = require(__brokerConfig.serviceInfoModule);

var protection = require('../index');

var po_info = {
    service_id: "po",
    description: "PO component",
    uri: "192.168.0.10:8000",
    image: "image"
};

var host = po_info.uri.split(":")[0];
var port = po_info.uri.split(":")[1];
var config = {
    protocol: 'http',
    po_id: "po",
    numberOfRetries: 2,
    basepath: __brokerConfig.po_basepath
};

var service_info = {
    location: "broker-ud",
    details: {
        service_id: "ud_service",
        description: "Service from the UD",
        uri: "192.168.1.16:9000",
        image: "image"
    },
    protectionConfigurationId: "ud_service"
}            

var protector = protection.Protector;

before(function(done) {
    protector.connect(config, function (error) {
        should.not.exist(error);
        done();
    });
});

beforeEach(function(done){
    nock(config.protocol + '://' + host + ':' + port)
    //.post('/v1/execute/' + service_info.details.service_id + '/protect')
    .post('/v1/execute/' + service_info.protectionConfigurationId + '/protect')
    .reply(200,13456789)

    nock(config.protocol + '://' + host + ':' + port)
    //.post('/v1/execute/' + service_info.details.service_id + '/unprotect')
    .post('/v1/execute/' + service_info.protectionConfigurationId + '/unprotect')
    .reply(200,13456788)
    done();
});


describe("Protection : ", function() {
    it("OK", function(done) {
        var originalBody = {
            "file": "\\sharedfolder\data\consumo_2012_envio_def.csv",
            "name": "demodataset",
            "shareable": true,
            "tableName": "riskscoring2017",
            "SQLQuery": "WHERE 1=1",
            "FSUseCase": "CreditScoring",
            "OperationalKey": "#{untrustedkey}"
        };
        protector.protect("someURL", service_info, {"X-Auth-Token": "SomeToken"}, originalBody, function(error, protectionResponse, finalCallParameters) {
                should.not.exist(error);
                should.exist(protectionResponse);
                should.not.exist(finalCallParameters);
                //The following simulates the reception of the callback from the PO
                var receivedCallParameters = {
                    "status": "success",
                    "results": [{
                        "key": "modifiedServiceParams",
                        "value": {
                            "file": "\\sharedfolder\data\consumo_2012_envio_def.csv",
                            "name": "demodataset",
                            "shareable": true,
                            "tableName": "riskscoring2017",
                            "SQLQuery": "WHERE 1=1",
                            "FSUseCase": "CreditScoring",
                            "OperationalKey": "ukuuid"
                        }
                    }]
                };
                protector.endProtection(originalBody, receivedCallParameters, function(error, finalCallParameters) {
                    should.not.exist(error);
                    should.exist(finalCallParameters);
                    finalCallParameters.OperationalKey.should.equal("ukuuid");
                    done();
                });
            });
    });
});

describe("Status",  function() {
    before(function(done){
        nock(config.protocol + '://' + host + ':' + port)
        .get('/v1/processstatus/' + 123456)
        .reply(200,{'code': 0, 'message': 'STATE_PENDING'});
        done();
    });
    it("Proctection status", function(done) {
        protector.getProcessStatus(123456, {'X-Auth-Token': 'token'}, function(error, statusResponse) {
            should.not.exist(error);
            should.exist(statusResponse);
            statusResponse.should.be.an.object;
            statusResponse.should.have.property('code');
            statusResponse.code.should.equal(0);
            statusResponse.should.have.property('message');
            statusResponse.message.should.equal('STATE_PENDING');
            done();
        });
    });
    before(function(done){
        nock(config.protocol + '://' + host + ':' + port)
        .get('/v1/processstatus/' + 123456)
        .reply(404);
        done();
    });
    it("Proctection status: NOT FOUND", function(done) {
        protector.getProcessStatus(123456, {'X-Auth-Token': 'token'}, function(error, statusResponse) {
            should.exist(error);
            should.not.exist(statusResponse);
            error.name.should.equal('PoError');
            error.code.should.equal(404);
            error.reason.should.equal('Requested process doesn\'t exist');
            done();
        });
    });
    before(function(done){
        nock(config.protocol + '://' + host + ':' + port)
        .get('/v1/processstatus/' + 555555)
        .reply(200,{'code': 1, 'message': 'STATE_ACTIVE'});
        done();
    });
    it("Unproctection status", function(done) {
        protector.getProcessStatus(555555, {'X-Auth-Token': 'token'}, function(error, statusResponse) {
            should.not.exist(error);
            should.exist(statusResponse);
            statusResponse.should.be.an.object;
            statusResponse.should.have.property('code');
            statusResponse.code.should.equal(1);
            statusResponse.should.have.property('message');
            statusResponse.message.should.equal('STATE_ACTIVE');
            done();
        });
    });
});

describe("Unprotection : ", function() {
    it("OK", function(done) {
        var originalBody = {
            "file": "\\sharedfolder\data\consumo_2012_envio_def.csv",
            "name": "demodataset",
            "shareable": true,
            "tableName": "riskscoring2017",
            "SQLQuery": "WHERE 1=1",
            "FSUseCase": "CreditScoring",
            "OperationalKey": "ukuuid"
        };
        protector.unprotect("someURL", service_info, {"X-Auth-Token": "SomeToken"}, originalBody, function(error, protectionResponse, finalCallParameters) {
                should.not.exist(error);
                should.exist(protectionResponse);
                should.not.exist(finalCallParameters);
                //The following simulates the reception of the callback from the PO
                var receivedCallParameters = {
                    "status": "success",
                    "results": [{
                        "key": "modifiedServiceParams",
                        "value": {
                            "file": "\\sharedfolder\data\consumo_2012_envio_def.csv",
                            "name": "demodataset",
                            "shareable": true,
                            "tableName": "riskscoring2017",
                            "SQLQuery": "WHERE 1=1",
                            "FSUseCase": "CreditScoring",
                            "OperationalKey": "#{untrustedkey}"
                        }
                    }]
                };
                protector.endUnprotection(originalBody, receivedCallParameters, function(error, finalCallParameters) {
                    should.not.exist(error);
                    should.exist(finalCallParameters);
                    finalCallParameters.OperationalKey.should.equal("#{untrustedkey}");
                    done();
                });
            });
    });
});