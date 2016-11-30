var should = require("should");
var nock = require('nock');

var protection = require('../index');

var config = {
        protocol: 'http',
        host: 'localhost',
        port: '1234',
        auth_token: 'some token',
        certificate_key: '../../CAs/witdomCA/client1_key.pem',
        certificate: '../../CAs/witdomCA/client1_crt.pem',
        ca: '../../CAs/witdomCA/witdomcacert.pem'}

var protector = protection.Protector;

before(function(done) {
    protector.connect(config, function (error) {
        should.not.exist(error);
        done();
    });
});

beforeEach(function(done){
    nock(config.protocol + '://' + config.host + ':' + config.port)
    .post('/execute/fs-riskscoring-createdataset/protect')
    .reply(200,13456789)

    nock(config.protocol + '://' + config.host + ':' + config.port)
    .post('/execute/fs-riskscoring-createdataset/unprotect')
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
        protector.protect("someURL", {"X-Auth-Token": "SomeToken"}, originalBody, function(error, protectionResponse, finalCallParameters) {
                should.not.exist(error);
                should.exist(protectionResponse);
                should.not.exist(finalCallParameters);
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
        protector.unprotect("someURL", {"X-Auth-Token": "SomeToken"}, originalBody, function(error, protectionResponse, finalCallParameters) {
                should.not.exist(error);
                should.exist(protectionResponse);
                should.not.exist(finalCallParameters);
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