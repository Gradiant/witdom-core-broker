
# Public IP of the broker in the other domain
# In a test setup, both brokers are deployed on the same machine, so the same value of this variable is passed bor both
REMOTE_HOST="172.16.118.243"

# Public IP of the Docker machine or dome name (for easier access to container in other domain)
OTHER_DOMAIN_NAME="broker"

# Names of MongoDB containers
MONGO_TD_NAME="mongo-broker-td"
MONGO_UD_NAME="mongo-broker-ud"

# Broker image and container names
BROKER_TD_IMAGE="witdom-core-broker-td"
BROKER_UD_IMAGE="witdom-core-broker-ud"
BROKER_TD_NAME="broker_td"
BROKER_UD_NAME="broker_ud"

# IAM Settings
USE_IAM="yes"
IAM_NAME="iam"


all: clean get_iam build run install test

ci: clean build run install test

test: test_unit test_api

build: build_trusted build_untrusted

clean: remove_containers remove_files

get_iam:
	git submodule init
	git submodule update

build_trusted: 
	./broker_docker.sh --command=rebuild-images --dockerfile=Dockerfile_td --image-name=$(BROKER_TD_IMAGE) --container-name=$(BROKER_TD_NAME)

build_untrusted:
	./broker_docker.sh --command=rebuild-images --dockerfile=Dockerfile_ud --image-name=$(BROKER_UD_IMAGE) --container-name=$(BROKER_UD_NAME)

run:
	./broker_docker.sh --command=run-containers --image-name=$(BROKER_TD_IMAGE) --container-name=$(BROKER_TD_NAME) --mongo-container=$(MONGO_TD_NAME) --container-http-port=5000 --container-https-port=5043 --host-http-port=5000 --host-https-port=5043 --remote-host=$(REMOTE_HOST) --remote-http-port=5100 --remote-https-port=5143 --other-domain-name=$(OTHER_DOMAIN_NAME) --use-iam=$(USE_IAM) --iam-container=$(IAM_NAME)
	./broker_docker.sh --command=run-containers --image-name=$(BROKER_UD_IMAGE) --container-name=$(BROKER_UD_NAME) --mongo-container=$(MONGO_UD_NAME) --container-http-port=5000 --container-https-port=5043 --host-http-port=5100 --host-https-port=5143 --remote-host=$(REMOTE_HOST) --remote-http-port=5000 --remote-https-port=5043 --other-domain-name=$(OTHER_DOMAIN_NAME)

install:
	npm install

test_unit:
	docker run --name mongo-broker-td-test -d -p 27017:27017 mongo
	npm run db_test
	npm run unit_test
	npm run si_test
	npm run mocksi_test
	npm run request_test
	docker stop mongo-broker-td-test && docker rm mongo-broker-td-test

test_api:
	# Before API tests, sleep
	# Sometimes some of the tests fail if we don't let some time pass before running tests
	sleep 15
	npm run api_test # All pass now

remove_containers:
	-./broker_docker.sh --command=stop-containers --container-name=$(BROKER_TD_NAME)
	-./broker_docker.sh --command=stop-containers --container-name=$(BROKER_UD_NAME)
	-./broker_docker.sh --command=remove-containers --container-name=$(BROKER_TD_NAME)
	-./broker_docker.sh --command=remove-containers --container-name=$(BROKER_UD_NAME)
	-docker stop $(MONGO_TD_NAME)
	-docker stop $(MONGO_UD_NAME)
	-docker rm $(MONGO_TD_NAME)
	-docker rm $(MONGO_UD_NAME)

remove_files:
	-rm -rf dependencies/iam/*	
	-rm -rf dependencies/iam/.*

bash:
	docker exec -it $(BROKER_TD_NAME) bash

logs: 
	docker logs $(BROKER_TD_NAME)