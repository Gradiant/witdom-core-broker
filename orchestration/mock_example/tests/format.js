var should = require("should");

var orchestration = require('../index');

var config = {host: '127.0.0.1',
              port: '1234',
              auth_token: 'some token'}

var orchestrator = new orchestration.Orchestrator();

before(function(done) {
    orchestrator.connect(config, function (error) {
        should.not.exist(error);
        done();
    });
});

describe("Services : ", function() {
    it("get service data", function(done) {
        orchestrator.getServiceData('service1', function(error, service_data) {
            should.not.exist(error);
            should.exist(service_data);
            service_data.image.should.equal("image_url");
            service_data.host.should.equal("127.0.0.1");
            service_data.port.should.equal("1234");
            service_data.description.should.equal("service_description");
            done();
        });
    });

    it("get unknown service data", function(done) {
        orchestrator.getServiceData('unknown', function(error, service_data) {
            should.exist(error);
            should.not.exist(service_data);
            done();
        });
    });

    it("update service", function(done) {
        orchestrator.getServiceList(function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.length.should.equal(9);
            for(i=1; i<services.lenght; i++) {
                services[i].name.should.equal("service" + i);
                services[i].image.should.equal("image_url");
                services[i].host.should.equal("127.0.0." + i);
                services[i].port.should.equal("1234");
                services[i].description.should.equal("service_description");
            }
            done();
        });
    });
});