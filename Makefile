# Broker container names
BROKER_TD_NAME="broker_trusted"
BROKER_UD_NAME="broker_untrusted"

all: clean get_iam build run install test

ci: build run install test

test: test_api test_unit

build: get_iam
	docker-compose build

clean: stop remove_files

get_iam:
	git submodule init
	git submodule update

run:
	docker-compose up -d

stop:
	docker-compose down
	
install:
	npm install

test_unit:
	npm run db_test
	npm run token_test
	npm run si_test
	npm run mocksi_test
	npm run forwardingHandler_test
	npm run requestHandler_test
	npm run restHandler_test  

test_api:
	# Before API tests, sleep
	# Sometimes some of the tests fail if we don't let some time pass before running tests
	sleep 15
	npm run api_test # All pass now

remove_files:
	-rm -rf dependencies/iam/*	
	-rm -rf dependencies/iam/.*

bash:
	docker exec -it $(BROKER_TD_NAME) bash

logs: 
	docker logs $(BROKER_TD_NAME)