#!/bin/bash
# This scripts allows to build, run, start, stop and delete a docker image and container for the broker along with its corresponding ambassadors
# 

COMMAND=""
IMAGE_NAME="witdom-core-broker"
CONTAINER_NAME="broker"
DOCKERFILE="Dockerfile"
MONGO_CONTAINER="mongo-broker-td"
OTHER_DOMAIN_NAME="broker-ud"
USE_IAM="no"
IAM_CONTAINER=""
IAM_LINK=""
CONTAINER_EXPOSED_HTTP_PORT="5000"
CONTAINER_EXPOSED_HTTPS_PORT="5043"
HOST_EXPOSED_HTTP_PORT="5000"
HOST_EXPOSED_HTTPS_PORT="5043"
REMOTE_HOST="localhost"
REMOTE_HTTP_PORT="5100"
REMOTE_HTTPS_PORT="5143"



remove_container()
{
    NAME=$1
    status=`sudo docker ps -a -f name=^/$NAME$ --format="{{.Status}}" | cut -d' ' -f 1`
    if [ -n "$status" ]; then # The image exists
        if [ $status = "Up" ]; then # The image is running
            echo "Stopping container $NAME..."
            sudo docker stop $NAME
            echo "Removing container $NAME..."
            sudo docker rm $NAME
        elif [ $status = "Exited" ]; then
            echo "Removing container $NAME..."
            sudo docker rm $NAME
        else
            echo "The container $NAME is in another status, trying to remove it..."
            sudo docker rm -f $NAME
        fi
    else
        echo "The container $NAME doesn't exist"
    fi
}

stop_container()
{
    NAME=$1
    status=`sudo docker ps -a -f name=^/$NAME$ --format="{{.Status}}" | cut -d' ' -f 1`
    if [ -n "$status" ]; then # The container exists
        if [ $status = "Up" ]; then # The container is running
            echo "Stopping container $NAME"
            sudo docker stop $NAME
        else
            echo "The container $NAME is not running"
        fi
    else
        echo "The container $NAME doesn't exist"
    fi 
}

container_exits()
{
    NAME=$1
    status=`sudo docker ps -a -f name=^/$NAME$ --format="{{.Status}}" | cut -d' ' -f 1`
    if [ -n "$status" ]; then # The container exists
        if [ $status = "Up" ]; then # The container is running
            #echo "The container $NAME is running"
            return 2
        else
            #echo "The container $NAME is not running"
            return 1
        fi
    else
        #echo "The container $NAME doesn't exist"
        return 0;
    fi
}

start_container()
{
    CONTAINER=$1
    #echo "Containr name: ${CONTAINER}"
    container_exits ${CONTAINER}
    res=`echo $?`;
    if [ $res = 0 ]; then
        echo "The container ${CONTAINER} doesn't exist so it can't be started"
    elif [ $res = 1 ]; then
        echo "Starting the container ${CONTAINER}"
        sudo docker start ${CONTAINER}
    elif [ $res = 2 ]; then
        echo "The container ${CONTAINER} is already running"
    fi
}
usage()
{
    echo "Usage $0 <options> <args>"
    echo "   where <options> may be"
    echo "     -h display usage information"
    echo "   where <args> may be:"
    echo "     --command=<command>        Specify which command to run (default: empty, value: build-images|delete-images|run-images|stop-containers|start-containers|remove-containres)"
    echo "     --image-name=<image-name>  Specify the name of the image that is goint to be built or used. (Default: witdom-core-broker)"
    echo "     --dockerfile=<dockerfile>  Specify the file name of the Dockerfile used to build the image. Only needed for command build-images (Default: Dockerfile)."
    echo "     --container-name=<name>    Specify the name for the container when running it"
    echo "     --use-iam=yes|no           Specify whether to use IAM or not. If the value is yes the name of the IAM container must be provided with --iam-container (Default: no)."
    echo "     --iam-container=<name>     Specify the name of the IAM container (Default: empty)"
    echo "     --container-http-port      Specify the container port exposed for http (Default: 5000)."
    echo "     --container-https-port     Specify the container port exposed for https (Default: 5043)."
    echo "     --host-http-port           Specify the host port linked to the container http port (Default: 5000)."
    echo "     --host-https-port          Specify the host port linked to the container https port (Default: 5043)."
    echo "     --remote-host              Specify the remote host name that the container will access (Default: localhost)."
    echo "     --remote-http-port         Specify the remote host http port that the container will access (Default: 5100)."
    echo "     --remote-https-port        Specify the remote host https port that the container will access (Default: 5143)."
    echo "     --mongo-container=<name>   Specify the name of the mongo container to use (Default: mongo-broker-td)"
    echo "     --other-domain-name=<name> Specify the domain name that this container can use to access the container of the other domain (Default: broker-ud)."
}

while [ "$1" != "" ]; do
    PARAM=`echo $1 | sed 's/=.*//'`
    VALUE=`echo $1 | sed 's/[^=]*//; s/=//'`
    case "$PARAM" in
    -h|--help)
        usage
        exit 0
        ;;
    --command)
        COMMAND="$VALUE"
        ;;
    --image-name)
        IMAGE_NAME="$VALUE"
        ;;
    --dockerfile)
        DOCKERFILE="$VALUE"
        ;;
    --container-name)
        CONTAINER_NAME="$VALUE"
        ;;
    --use-iam)
        USE_IAM="$VALUE"
        ;;
    --iam-container)
        IAM_CONTAINER="$VALUE"
        ;;
    --container-http-port)
        CONTAINER_EXPOSED_HTTP_PORT="$VALUE"
        ;;
    --container-https-port)
        CONTAINER_EXPOSED_HTTPS_PORT="$VALUE"
        ;;
    --host-http-port)
        HOST_EXPOSED_HTTP_PORT="$VALUE"
        ;;
    --host-https-port)
        HOST_EXPOSED_HTTPS_PORT="$VALUE"
        ;;
    --remote-host)
        REMOTE_HOST="$VALUE"
        ;;
    --remote-http-port)
        REMOTE_HTTP_PORT="$VALUE"
        ;;
    --remote-https-port)
        REMOTE_HTTPS_PORT="$VALUE"
        ;;
    --mongo-container)
        MONGO_CONTAINER="$VALUE"
        ;;
    --other-domain-name)
        OTHER_DOMAIN_NAME="$VALUE"
        ;;
    *)
        echo "$PARAM arg is not valid!"
        usage
        exit 1
        ;;
    esac
    shift
done

if [ $USE_IAM = "yes" ]; then
    IAM_LINK="--link $IAM_CONTAINER:iam"
fi


case "$COMMAND" in
build-images)
    echo "Building image $IMAGE_NAME from $DOCKERFILE"
    sudo docker build -f $DOCKERFILE -t $IMAGE_NAME .
;;
rebuild-images)
    echo "Removing any existing related container"
    remove_container $CONTAINER_NAME
    remove_container $CONTAINER_NAME"_ambassador_server"
    remove_container $CONTAINER_NAME"_ambassador_client"

    echo "Deleting docker image '$IMAGE_NAME'"
    sudo docker rmi $IMAGE_NAME 


    echo "Building image $IMAGE_NAME from $DOCKERFILE"
    sudo docker build -f $DOCKERFILE -t $IMAGE_NAME .
;;
delete-images)
    # First check if there exists any container launched with the provided container name
    remove_container $CONTAINER_NAME

    # Then check for the ambassador containers
    # First the ambassador server
    remove_container $CONTAINER_NAME"_ambassador_server"
    
    # Then the ambassador client
    remove_container $CONTAINER_NAME"_ambassador_client"

    # Last delete the docker image
    echo "Deleting docker image '$IMAGE_NAME'"
    sudo docker rmi $IMAGE_NAME 
;;
run-containers)
    if [ $USE_IAM = "yes" ]; then
        echo "Checking status of the IAM container..."
        container_exits $IAM_CONTAINER
        res=`echo $?`
        if [ $res = 0 ]; then
            echo "Error: the IAM container '${IAM_CONTAINER}' doesn't exist. Exiting!'"
            exit 1
        elif [ $res = 1 ]; then
            echo "Starting the IAM container '${IAM_CONTAINER}'"
            sudo docker start ${IAM_CONTAINER}
        elif [ $res = 2 ]; then
            echo "The container ${IAM_CONTAINER} is already running"
        fi
    fi

    echo "Checking status of the Mongo container..."
    container_exits $MONGO_CONTAINER
    res=`echo $?`
    if [ $res = 0 ]; then
        echo "The mongo container doesn't exist, running it with name '${MONGO_CONTAINER}'"
        sudo docker run --name ${MONGO_CONTAINER} -d mongo
        #echo "Error: the Mongo container '${MONGO_CONTAINER}' doesn't exist. Exiting!'"
        #exit 1
    elif [ $res = 1 ]; then
        echo "Starting the Mongo container '${MONGO_CONTAINER}'"
        sudo docker start ${MONGO_CONTAINER}
    elif [ $res = 2 ]; then
        echo "The container ${MONGO_CONTAINER} is already running"
    fi

    # First remove the containers if they exist
    echo "Removing any existing related container..."
    remove_container $CONTAINER_NAME
    remove_container $CONTAINER_NAME"_ambassador_server"
    remove_container $CONTAINER_NAME"_ambassador_client"

    # Then run the broker container and its ambassadors
    #echo "sudo docker run --name ${CONTAINER_NAME}_ambassador_client --expose $REMOTE_HTTP_PORT -e ${CONTAINER_NAME^^}_HTTP_PORT_${REMOTE_HTTP_PORT}_TCP=tcp://10.5.1.120:${REMOTE_HTTP_PORT} --expose ${REMOTE_HTTPS_PORT} -e ${CONTAINER_NAME^^}_HTTPS_PORT_${REMOTE_HTTPS_PORT}_TCP=tcp://10.5.1.120:${REMOTE_HTTPS_PORT} -d svendowideit/ambassador"
    echo "Running '${CONTAINER_NAME}_ambassador_client' container..."
    sudo docker run --name ${CONTAINER_NAME}_ambassador_client --expose $REMOTE_HTTP_PORT -e ${CONTAINER_NAME^^}_HTTP_PORT_${REMOTE_HTTP_PORT}_TCP=tcp://10.5.1.120:${REMOTE_HTTP_PORT} --expose ${REMOTE_HTTPS_PORT} -e ${CONTAINER_NAME^^}_HTTPS_PORT_${REMOTE_HTTPS_PORT}_TCP=tcp://10.5.1.120:${REMOTE_HTTPS_PORT} -d svendowideit/ambassador
    #echo "sudo docker run --name ${CONTAINER_NAME} $IAM_LINK --link $MONGO_CONTAINER:mongo --link ${CONTAINER_NAME}_ambassador_client:$OTHER_DOMAIN_NAME -d $IMAGE_NAME"
    echo "Running '${CONTAINER_NAME}' container..."
    sudo docker run --name ${CONTAINER_NAME} $IAM_LINK --link $MONGO_CONTAINER:mongo --link ${CONTAINER_NAME}_ambassador_client:$OTHER_DOMAIN_NAME -d $IMAGE_NAME
    #echo "sudo docker run --name ${CONTAINER_NAME}_ambassador_server --link $CONTAINER_NAME:$CONTAINER_NAME -p ${HOST_EXPOSED_HTTP_PORT}:${CONTAINER_EXPOSED_HTTP_PORT} -p ${HOST_EXPOSED_HTTPS_PORT}:${CONTAINER_EXPOSED_HTTPS_PORT} -d svendowideit/ambassador"
    echo "Running '${CONTAINER_NAME}_ambassador_server' container..."
    sudo docker run --name ${CONTAINER_NAME}_ambassador_server --link $CONTAINER_NAME:$CONTAINER_NAME -p ${HOST_EXPOSED_HTTP_PORT}:${CONTAINER_EXPOSED_HTTP_PORT} -p ${HOST_EXPOSED_HTTPS_PORT}:${CONTAINER_EXPOSED_HTTPS_PORT} -d svendowideit/ambassador
;;
start-containers)
    start_container ${CONTAINER_NAME}_ambassador_client # Tries to start the container
    start_container ${CONTAINER_NAME} # Tries to start the container
    start_container ${CONTAINER_NAME}_ambassador_server # Tries to start the container
;;
stop-containers)
    # First stop the container with the provided container name if it is running
    stop_container $CONTAINER_NAME
    # Then stop the ambassadro server
    stop_container $CONTAINER_NAME"_ambassador_server"
    # Then the ambassador client
    stop_container $CONTAINER_NAME"_ambassador_client"

;;
remove-containers)
    remove_container $CONTAINER_NAME
    remove_container $CONTAINER_NAME"_ambassador_server"
    remove_container $CONTAINER_NAME"_ambassador_client"
;;
*)
    echo "Wrong command selected: $COMMAND"
    usage
    exit 1
;;
esac

exit 0