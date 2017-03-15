#!/bin/bash

HOST=$1
PORT=$2

if [ -z "$HOST" ]; then
	HOST="broker-td"
fi

if [ -z "$PORT" ]; then
	PORT="5043"
fi

function curl_status_and_body {

	# store the whole response with the status at the and
	eval CMD="$1"
	THE_COMMAND="$CMD --write-out \"HTTPSTATUS:%{http_code}\""
	#echo ${THE_COMMAND}
	HTTP_RESPONSE=`eval ${THE_COMMAND}`

	# extract the body
	HTTP_BODY=$(echo $HTTP_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

	# extract the status
	HTTP_STATUS=$(echo $HTTP_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

}

function get_result {

	command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${2}' 'https://${HOST}:${PORT}/v1/request/getresult?request_id=${1}'"
	#echo "$command"
	curl_status_and_body "\${command}"

	while [ "202" -eq "${HTTP_STATUS}" ]; do
		echo -n "."
		sleep 1
		curl_status_and_body "\${command}"
	done

}


echo "URI: ${HOST}:${PORT}"

# COLOR AND FORMAT VARIABLES
RED='\033[0;31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
MAGENTA='\033[35m'
CYAN='\033[36m'
UNDERLINE='\033[4m'
BOLD='\033[1m'
NC='\033[0m' # No Color

#######################################
######  GET THE TOKEN FROM IAM   ######
#######################################
command="curl -v -X POST --header 'Content-Type: application/json' -d '{\"auth\":{\"identity\":{\"methods\": [\"password\"],\"password\": {\"user\": {\"domain\": {\"name\": \"Default\"}, \"name\": \"testuser\", \"password\": \"testuser\"}}}}}' http://localhost:5001/v3/auth/tokens  2>&1 | grep -Fi \"X-Subject-Token\" | cut -d':' -f2 | cut -d' ' -f2- | tr -d '\r'"
token=`eval $command`


#######################################
#####   TRUSTED DOMAIN REQUESTS   #####
#######################################
echo -e "##### ${BLUE}Requests to the trusted domain.${NC} #####"

##### NON-BLOCKER REQUESTS #####
echo -e "\$\$\$ ${YELLOW}${UNDERLINE}Non-blocker requests${NC} \$\$\$"
### POST ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating non-blocker POST request to a trusted domain service that responds directly.${NC}"
echo "====== POST /request/create ====="

command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{}' 'https://${HOST}:${PORT}/v1/request/create/trusted-service/%2Fv1%2Fdummy_service_td%2Fno_cb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${BLUE}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid} ${token}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi


echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating non-blocker POST request to a trusted domain service that responds with a callback.${NC}"
echo "====== POST /request/create ====="
command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'https://${HOST}:${PORT}/v1/request/create/trusted-service/%2Fv1%2Fdummy_service_td%2Fcb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${BLUE}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid} ${token}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi


echo ""
### GET ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating non-blocker GET request to a trusted domain service that responds directly.${NC}"
echo "====== GET /request/create ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create/trusted-service/%2Fv1%2Fdummy_service_td%2Fno_cb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${BLUE}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid} ${token}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker:${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker:${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating non-blocker GET request to a trusted domain service that responds with a callback.${NC}"
echo "====== GET /request/create ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create/trusted-service/%2Fv1%2Fdummy_service_td%2Fcb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${BLUE}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid} ${token}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker:${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker:${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi


echo ""
##### BLOCKER REQUESTS #####
echo -e "\$\$\$ ${MAGENTA}${UNDERLINE}Blocker requests${NC} \$\$\$"
### POST ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating blocker POST request to a trusted domain service that responds directly.${NC}"
echo "===== POST /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'https://${HOST}:${PORT}/v1/request/create_blocker/trusted-service/%2Fv1%2Fdummy_service_td%2Fno_cb'"
#echo ${command}
result=`eval $command`
echo -e "${BLUE}Request ended, got result:${NC}"
echo $result

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating blocker POST request to a trusted domain service that responds with a callback.${NC}"
echo "===== POST /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'https://${HOST}:${PORT}/v1/request/create_blocker/trusted-service/%2Fv1%2Fdummy_service_td%2Fcb'"
#echo ${command}
result=`eval $command`
echo -e "${BLUE}Request ended, got result:${NC}"
echo $result

echo ""
### GET ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating blocker GET request to a trusted domain service that responds directly.${NC}"
echo "===== GET /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create_blocker/trusted-service/%2Fv1%2Fdummy_service_td%2Fno_cb'"
#echo ${command}
result=`eval $command`
echo -e "${BLUE}Request ended, got result:${NC}"
echo $result

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${BLUE}Creating blocker GET request to a trusted domain service that responds with a callback.${NC}"
echo "===== GET /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create_blocker/trusted-service/%2Fv1%2Fdummy_service_td%2Fcb'"
#echo ${command}
result=`eval $command`
echo -e "${BLUE}Request ended, got result:${NC}"
echo $result


echo ""
echo ""
#########################################
#####   UNTRUSTED DOMAIN REQUESTS   #####
#########################################
echo -e "##### ${GREEN}Requests to the untrusted domain.${NC} #####"

##### NON-BLOCKER REQUESTS #####
echo -e "\$\$\$ ${YELLOW}${UNDERLINE}Non-blocker requests${NC} \$\$\$"
### POST ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating non-blocker POST request to an untrusted domain service that responds directly.${NC}"
echo "====== POST /request/create ====="
command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'https://${HOST}:${PORT}/v1/request/create/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fno_cb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${GREEN}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid} ${token}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi


echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating non-blocker POST request to an untrusted domain service that responds with a callback.${NC}"
echo "====== POST /request/create ====="
command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'https://${HOST}:${PORT}/v1/request/create/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fcb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${GREEN}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid} ${token}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi


echo ""
### GET ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating non-blocker GET request to an untrusted domain service that responds directly.${NC}"
echo "====== GET /request/create ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fno_cb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${GREEN}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker:${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker:${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating non-blocker GET request to an untrusted domain service that responds with a callback.${NC}"
echo "====== GET /request/create ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fcb'"
#echo ${command}
requestid=`eval $command`
echo -e "${BOLD}Request id=$requestid${NC}"

sleep 1

echo -e "${GREEN}Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

get_result ${requestid} ${token}
echo ""

if [ "200" -eq "${HTTP_STATUS}" ]; then
	echo -e "${BOLD}Got result data from broker:${NC}"
	echo "${HTTP_BODY}"
else
	echo -e "${BOLD}Got error from broker:${NC}"
	echo -e "${RED}${HTTP_STATUS}${NC}"
	echo "${HTTP_BODY}"
fi


echo ""
##### BLOCKER REQUESTS #####
echo -e "\$\$\$ ${MAGENTA}${UNDERLINE}Blocker requests${NC} \$\$\$		"
### POST ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating blocker POST request to an untrusted domain service that responds directly.${NC}"
echo "===== POST /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'https://${HOST}:${PORT}/v1/request/create_blocker/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fno_cb'"
#echo ${command}
result=`eval $command`
echo -e "${GREEN}Request ended, got result:${NC}"
echo $result

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating blocker POST request to an untrusted domain service that responds with a callback.${NC}"
echo "===== POST /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X POST --header 'X-Auth-Token: ${token}' --header 'Content-Type: application/json' --header 'Accept: application/text' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'https://${HOST}:${PORT}/v1/request/create_blocker/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fcb'"
#echo ${command}
result=`eval $command`
echo -e "${GREEN}Request ended, got result:${NC}"
echo $result

echo ""
### GET ###
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating blocker GET request to an untrusted domain service that responds directly.${NC}"
echo "===== GET /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create_blocker/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fno_cb'"
#echo ${command}
result=`eval $command`
echo -e "${GREEN}Request ended, got result:${NC}"
echo $result

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "${GREEN}Creating blocker GET request to an untrusted domain service that responds with a callback.${NC}"
echo "===== GET /request/create_blocker ====="
command="curl --cacert certs/tdcacert.pem -s -X GET --header 'X-Auth-Token: ${token}' --header 'Accept: application/text' 'https://${HOST}:${PORT}/v1/request/create_blocker/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fcb'"
#echo ${command}
result=`eval $command`
echo -e "${GREEN}Request ended, got result:${NC}"
echo $result