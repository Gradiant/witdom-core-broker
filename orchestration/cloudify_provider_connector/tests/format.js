var should = require("should");
var nock = require('nock');

var orchestration = require('../index');

var config = {
        protocol: 'http',
        host: '10.10.30.4',
        port: '80',
        auth_token: 'some token',
        certificate_key: '../../CAs/witdomCA/client1_key.pem',
        certificate: '../../CAs/witdomCA/client1_crt.pem',
        ca: '../../CAs/witdomCA/witdomcacert.pem'}

var orchestrator = orchestration.Orchestrator;

before(function(done) {
    orchestrator.connect(config, function (error) {
        should.not.exist(error);
        done();
    });
});

/*beforeEach(function(done){
    nock(config.protocol + '://' + config.host + ':' + config.port)
    .get('/api/v2/deployments')
    .reply(200,{
        items: [
            {
                outputs: {
                    endpoints: [
                        {
                            name : 'service1',
                            description: 'service1_description',
                            host: 'service1_host',
                            port: 'service1_port',
                            image: 'image1_url'
                        },{
                            name : 'service2',
                            description: 'service2_description',
                            host: 'service2_host',
                            port: 'service2_port',
                            image: 'image2_url'
                        }
                    ]
                }
            },{
                outputs: {
                    endpoints: [
                        {
                            name : 'service3',
                            description: '',
                            host: 'service3_host',
                            port: 'service3_port'
                        }
                    ]
                }
            },{
                outputs: {
                    endpoints: [
                        {
                            name : 'service4',
                            description: 'service4_description',
                            host: 'service3_host',
                            image: 'image3_url'
                        }
                    ]
                }
            },{
                outupts: {
                    endpoints: [
                        {
                            name : 'service5',
                            description: 'service5_description',
                            host: 'service5_host',
                            port: 'service5_port',
                            image: 'image5_url'
                        }
                    ]
                }
            },{
                outputs: {
                    endpoint: [
                        {
                            name : 'service6',
                            description: 'service6_description',
                            host: 'service6_host',
                            port: 'service6_port',
                            image: 'image6_url'
                        }
                    ]
                }
            },{
                outputs: ""
            },{
                outputs: {
                    endpoints:{
                        name : 'service7',
                        description: 'service7_description',
                        host: 'service7_host',
                        port: 'service7_port',
                        image: 'image7_url'
                    }
                }
            }

        ]
    })
    done();
});*/

describe("Services : ", function() {
    it("get service2 data", function(done) {
        orchestrator.getServiceData('untrusted-service', function(error, service_data) {
            should.not.exist(error);
            should.exist(service_data);
            service_data.image.should.be.a.string;
            service_data.host.should.be.a.string;
            service_data.port.should.be.a.string;
            service_data.description.should.be.a.string;
            done();
        });
    });

    /*it("get service3 data", function(done) {
        orchestrator.getServiceData('service3', function(error, service_data) {
            should.not.exist(error);
            should.exist(service_data);
            service_data.image.should.be.a.string;
            service_data.host.should.be.a.string;
            service_data.port.should.be.a.string;
            service_data.description.should.be.a.string;
            done();
        });
    });*/

    it("get unknown service data", function(done) {
        orchestrator.getServiceData('unknown', function(error, service_data) {
            should.exist(error);
            error.code.should.equal(404);
            should.not.exist(service_data);
            done();
        });
    });

    /*it("get malfomed service data", function(done) {
        orchestrator.getServiceData('service4', function(error, service_data) {
            should.exist(error);
            error.code.should.equal(404);
            should.not.exist(service_data);
            done();
        });
    });*/

    /*it("get malfomed deployment (outputs) data", function(done) {
        orchestrator.getServiceData('service5', function(error, service_data) {
            should.exist(error);
            error.code.should.equal(404);
            should.not.exist(service_data);
            done();
        });
    });*/

    /*it("get malfomed deployment (endpoints) data", function(done) {
        orchestrator.getServiceData('service6', function(error, service_data) {
            should.exist(error);
            error.code.should.equal(404);
            should.not.exist(service_data);
            done();
        });
    });*/

    it("get all services", function(done) {
        orchestrator.getServiceList(function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.length.should.equal(1);
            for(i=1; i<services.length; i++) {
                services[i].name.should.be.a.string;
                services[i].image.should.be.a.string;
                services[i].host.should.be.a.string;
                services[i].port.should.be.a.string;
                services[i].description.should.be.a.string;
            }
            done();
        });
    });
});