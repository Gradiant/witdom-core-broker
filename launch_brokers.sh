#!/bin/bash

#Lauch TD Broker
sudo docker run --name broker_ud_ambassador_client --expose 5100 -e BROKER_UD_HTTP_PORT_5100_TCP=tcp://10.5.1.120:5100 --expose 5143 -e BROKER_UD_HTTPS_PORT_5143_TCP=tcp://10.5.1.120:5143 -d svendowideit/ambassador
sudo docker run --name broker_td --link iam:iam --link mongo-broker-td:mongo --link broker_ud_ambassador_client:broker-ud -d witdom-core-broker-td
sudo docker run --name broker_td_ambassador_server --link broker_td:broker_td -p 5000:5000 -p 5043:5043 -d svendowideit/ambassador

#Lauch UD Broker
sudo docker run --name broker_td_ambassador_client --expose 5000 -e BROKER_TD_HTTP_PORT_5000_TCP=tcp://10.5.1.120:5000 --expose 5043 -e BROKER_TD_HTTPS_PORT_5043_TCP=tcp://10.5.1.120:5043 -d svendowideit/ambassador
sudo docker run --name broker_ud --link mongo-broker-ud:mongo --link broker_td_ambassador_client:broker-td -d witdom-core-broker-ud
sudo docker run --name broker_ud_ambassador_server --link broker_ud:broker_ud -p 5100:5000 -p 5143:5043 -d svendowideit/ambassador