#!/bin/bash

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


HOST=$1
PORT=$2

if [ -z "$HOST" ]; then
	HOST="localhost"
fi

if [ -z "$PORT" ]; then
	PORT="5000"
fi

echo "URI: ${HOST}:${PORT}"

RED='\033[0;31m'
NC='\033[0m' # No Color

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Creating non-blocker request to the untrusted domain service.${NC}"

echo "====== POST /request/create ====="

command="curl -s -X POST --header 'Content-Type: application/json' --header 'Accept: application/text' --header 'X-Auth-Token: the_token' -d '{\"param1\":\"value\",\"param2\":\"value\"}' 'http://${HOST}:${PORT}/v1/request/create/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fno_cb'"
echo ${command}
requestid=`eval $command`

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo "Resquest id=$requestid"

sleep 1

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

command="curl -s -X GET --header 'X-Auth-Token: the_token' 'http://${HOST}:${PORT}/v1/request/getresult?request_id=${requestid}'"
echo "$command"
curl_status_and_body "\${command}"
#echo "-----------------------------"
#echo "status code: ${HTTP_STATUS}"
#echo "result: ${HTTP_BODY}"


#while [ "200" -ne "$statuscode" ]; do
while [ "200" -ne "${HTTP_STATUS}" ]; do
	echo -n "."
	sleep 1
	curl_status_and_body "\${command}"
done
echo ""

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Got result data from broker${NC}"
echo "${HTTP_BODY}"


echo ""
echo ""

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Creating blocker request to the untrusted domain service.${NC}"
echo "===== POST /request/create_blocker ====="

#command="curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'X-Auth-Token: the_token' -d '{}' 'http://${HOST}:${PORT}/v1/request/create_blocker/untrusted-service/v1/dummy_service_ud/no_cb'"
#command2="curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'X-Auth-Token: the_token' -d '{}' 'http://${HOST}:${PORT}/v1/request/create_blocker/untrusted-service/v1/dummy_service_ud/no_cb' 2> /dev/null"

command="curl -s -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'X-Auth-Token: the_token' -d '{}' 'http://${HOST}:${PORT}/v1/request/create_blocker/untrusted-service/v1/dummy_service_ud/no_cb'"

echo ${command}
#result=`eval ${command2}`
result=`eval ${command}`

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Request ended, got result.${NC}"
echo $result
echo ""
