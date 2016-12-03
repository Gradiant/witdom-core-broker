#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Creating non-blocker request to the untrusted domain service.${NC}"

echo "====== POST /request/create ====="

echo curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/text' --header 'X-Auth-Token: the_token' -d '{"param1":"value","param2":"value"}' 'http://10.10.30.47:50100/v1/request/create/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fno_cb'
requestid=`curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/text' --header 'X-Auth-Token: the_token' -d '{"param1":"value","param2":"value"}' 'http://10.10.30.47:50100/v1/request/create/untrusted-service/%2Fv1%2Fdummy_service_ud%2Fno_cb' 2> /dev/null`

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo "Resquest id=$requestid"

sleep 1

echo ""
echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Recovering result from broker.${NC}"
echo "====== GET /request/getresult ====="

#command="curl -X GET --header \"Accept: application/text\" \"http://10.10.30.47:50100/v1/request/getresult?request_id=${requestid}\""
command="curl -v -X GET 'http://10.10.30.47:50100/v1/request/getresult?request_id=${requestid}' 1> res 2> error"
command2="curl -v -X GET 'http://10.10.30.47:50100/v1/request/getresult?request_id=${requestid}'"
echo $command2
#result=`$command`
eval $command
statuscode=`cat error | head -n 11 | tail -n 1 | cut -d' ' -f3`
result=`<res` 
#result=`curl -vv -X GET --header 'Accept: application/text' http://10.10.30.47:50100/v1/request/getresult?request_id=$requestid /dev/null`

while [ "200" -ne "$statuscode" ]; do
	echo -n "."
	sleep 1
	eval $command
	statuscode=`cat error | head -n 11 | tail -n 1 | cut -d' ' -f3`
	result=`<res` 
done
echo ""

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Got result data from broker${NC}"
echo "$result"
#echo $statuscode


echo ""
echo ""

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Creating blocker request to the untrusted domain service.${NC}"
echo "===== POST /request/create_blocker ====="

echo curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'X-Auth-Token: the_token' -d '{}' 'http://10.10.30.47:50100/v1/request/create_blocker/untrusted-service/v1/dummy_service_ud/no_cb'
result=`curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'X-Auth-Token: the_token' -d '{}' 'http://10.10.30.47:50100/v1/request/create_blocker/untrusted-service/v1/dummy_service_ud/no_cb' 2> /dev/null`

echo -ne "${RED}[$(date +"%Y%m%d_%H:%M:%S.%3N")] "
echo -e "Request ended, got result.${NC}"
echo $result
echo ""
