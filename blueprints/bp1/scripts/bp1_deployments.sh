#!/bin/bash


# S1 = Service 1 (Node)
# S2 = Service 2 (Mongo)
# W1 = Worker 1 ("Prince image")
# W2 = Worker 2 ("Prince image")
# Wx = Worker x (.... you get the idea)

BP_TAG="cloudify1"
S1_EXTERNAL_PORT=50000
S1_INTERNAL_PORT=5000
S1_PORT=$S1_INTERNAL_PORT
S1_IMAGE="witdom/broker_ud:latest"
S1_NAME="nodejs_$BP_TAG"


S2_NAME="mongo_$BP_TAG"
S2_IMAGE="mongo:latest"

#W1_PORT=9082
W1_PORT=8080
W1_IMAGE="witdom/dummy:latest"
W1_NAME="untrusted_$BP_TAG"
W1_DESC="Worker1 Description"
W1_IMAGE_URL="https://gradiant.org/wp-content/themes/gradiant/images/Gradiant_logo.jpg"


# construct this
if [ "$BP_TAG" == "cloudify1" ];
then
	CLOUDIFY_IP_ADDRESS=REPLACE_WITH_PRIMARY_CLOUDIFY_MANAGER_IP_ADDRESS
else
	CLOUDIFY_IP_ADDRESS=REPLACE_WITH_SECONDARY_CLOUDIFY_MANAGER_IP_ADDRESS
fi

W1_IP_ADDRESS=
W1_PARAMS=


ctx logger info "[$BP_TAG] Running S2 Docker container using image $S2_IMAGE. No ports exposed."
docker run -d --name $S2_NAME $S2_IMAGE

ctx logger info "[$BP_TAG] Running S1 Docker container $S1_NAME using image $S1_IMAGE. Exposing port $S1_EXTERNAL_PORT."
docker run -d -p $S1_EXTERNAL_PORT:$S1_INTERNAL_PORT --add-host=broker:REPLACE_WITH_DOCKER_ENGINE_IP -e BROKER_PORT=50100 --add-host=cloudify:$CLOUDIFY_IP_ADDRESS --link $S2_NAME:mongo --name $S1_NAME $S1_IMAGE


S1_IP_ADDRESS=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $S1_NAME)
#S2_IP_ADDRESS=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $S2_NAME)


#W1_PARAMS="-p $W1_PORT:8080 --add-host=broker:$S1_IP_ADDRESS -e BROKER_PORT=$S1_PORT"
W1_PARAMS="--add-host=broker:$S1_IP_ADDRESS -e BROKER_PORT=$S1_PORT"

docker run -d --name $W1_NAME $W1_PARAMS $W1_IMAGE

W1_IP_ADDRESS=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $W1_NAME)

if [ -z "$W1_IP_ADDRESS" ];
then
	W1_IP_ADDRESS=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $W1_NAME)
fi

ctx logger info "Cloudify Manager at $CLOUDIFY_IP_ADDRESS"
ctx logger info "W1 Docker container IP address is $W1_IP_ADDRESS"
ctx instance runtime-properties w1_ip_address $W1_IP_ADDRESS
ctx instance runtime-properties w1_internal_port $W1_PORT
ctx instance runtime-properties w1_image_url $W1_IMAGE_URL
ctx instance runtime-properties w1_name $W1_NAME

