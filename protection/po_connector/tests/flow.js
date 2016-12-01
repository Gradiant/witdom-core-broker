global.__base = __dirname + '/../../../'; //Save the broker base directory
var brokerConfig = require(__base +'config');
global.__brokerConfig = brokerConfig;
var should = require("should");
var nock = require('nock');

//Set the serviceInfoModule to 'mockServiceInfo'
__brokerConfig.serviceInfoModule = __base + "service_info/mockServiceInfo";

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
    //host: 'localhost',
    //port: '1234',
    auth_token: 'some token',
    certificate_key: '../../CAs/witdomCA/client1_key.pem',
    certificate: '../../CAs/witdomCA/client1_crt.pem',
    ca: '../../CAs/witdomCA/witdomcacert.pem',
    po_id: "po"
};

var service_info = {
    location: "broker-ud",
    details: {
        service_id: "ud_service",
        description: "Service from the UD",
        uri: "192.168.1.16:9000",
        image: "image"
    }
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
    .post('/execute/' + service_info.details.service_id + '/protect')
    .reply(200,13456789)

    nock(config.protocol + '://' + host + ':' + port)
    .post('/execute/' + service_info.details.service_id + '/unprotect')
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