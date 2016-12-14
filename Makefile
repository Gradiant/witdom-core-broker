
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


all: clean build run install test

build: build_trusted build_untrusted

clean: remove_containers remove_files

get_iam:
	git submodule init
	git submodule update

build_trusted: 
	./broker_docker.sh --command=rebuild-images --dockerfile=Dockerfile_td --image-name=witdom-core-broker-td --container-name=broker_td

build_untrusted:
	./broker_docker.sh --command=rebuild-images --dockerfile=Dockerfile_ud --image-name=witdom-core-broker-ud --container-name=broker_ud

run:
	./broker_docker.sh --command=run-containers --image-name=$(BROKER_TD_IMAGE) --container-name=$(BROKER_TD_NAME) --mongo-container=$(MONGO_TD_NAME) --container-http-port=5000 --container-https-port=5043 --host-http-port=5000 --host-https-port=5043 --remote-host=$(REMOTE_HOST) --remote-http-port=5100 --remote-https-port=5143 --other-domain-name=$(OTHER_DOMAIN_NAME) --use-iam=$(USE_IAM) --iam-container=$(IAM_NAME)
	./broker_docker.sh --command=run-containers --image-name=$(BROKER_UD_IMAGE) --container-name=$(BROKER_UD_NAME) --mongo-container=$(MONGO_UD_NAME) --container-http-port=5000 --container-https-port=5043 --host-http-port=5100 --host-https-port=5143 --remote-host=$(REMOTE_HOST) --remote-http-port=5000 --remote-https-port=5043 --other-domain-name=$(OTHER_DOMAIN_NAME)

install:
	npm install
	# Before API tests, sleep
	#sleep 10 # Sometimes some of the tests fail if we don't let some time pass before running tests

test:
	npm run unit_test # 
	#npm run api_test # All pass now

remove_containers:
	./broker_docker.sh --command=stop-containers --container-name=broker_td
	./broker_docker.sh --command=stop-containers --container-name=broker_ud
	./broker_docker.sh --command=remove-containers --container-name=broker_td
	./broker_docker.sh --command=remove-containers --container-name=broker_ud
	docker stop mongo-broker-td
	docker stop mongo-broker-ud
	docker rm mongo-broker-td
	docker rm mongo-broker-ud

remove_files:
	-rm -rf dependencies/iam/*	
	-rm -rf dependencies/iam/.*

bash:
	docker exec -it broker_td bash

logs: 
	docker logs broker_td