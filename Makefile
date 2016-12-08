all: clean get_iam build run test

build: build_trusted build_untrusted

test: test_trusted #test_untrusted

clean: remove_containers remove_files

get_iam:
	git clone ssh://git@gitlab-eu2.xlab.si:14022/WitdomWP5/witdom-core-iam.git dependencies/iam/ || true

build_trusted: 
	./broker_docker.sh --command=rebuild-images --dockerfile=Dockerfile_td --image-name=witdom-core-broker-td --container-name=broker_td

build_untrusted:
	./broker_docker.sh --command=build-images --dockerfile=Dockerfile_ud --image-name=witdom-core-broker-ud --container-name=broker_ud

run:
	docker run --name mongo-broker -d mongo
	./broker_docker.sh --command=run-containers --image-name=witdom-core-broker-td --container-name=broker_td --mongo-container=mongo-broker-td --container-http-port=5000 --container-https-port=5043 --host-http-port=5000 --host-https-port=5043 --remote-host=localhost --remote-http-port=5100 --remote-https-port=5143 --other-domain-name=broker-ud #--use-iam=yes --iam-container=iam
	./broker_docker.sh --command=run-containers --image-name=witdom-core-broker-ud --container-name=broker_ud --mongo-container=mongo-broker-ud --container-http-port=5000 --container-https-port=5043 --host-http-port=5100 --host-https-port=5143 --remote-host=localhost --remote-http-port=5000 --remote-https-port=5043 --other-domain-name=broker-td

test_trusted:
	docker exec -it broker_td npm test

remove_containers:
	-./broker_docker.sh --command=stop-containers --container-name=broker_td
	-./broker_docker.sh --command=stop-containers --container-name=broker_ud
	-docker stop mongo-broker
	-docker rm broker_td
	-docker rm broker_ud
	-docker rm mongo-broker

remove_files:
	rm -rf dependencies/iam/*	
	-rm -rf dependencies/iam/.*

bash:
	docker exec -it broker_td bash