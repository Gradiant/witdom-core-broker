FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/broker
WORKDIR /usr/src/broker

# Copy and install app dependencies
COPY dependencies/iam/keystone-clients/javascript-wrappers/node-openstack-token-utils/. dependencies/iam/keystone-clients/javascript-wrappers/node-openstack-token-utils
COPY package.json /usr/src/broker
COPY orchestration/. orchestration/
RUN npm install

# Bundle app source
COPY broker.js ./
COPY config_and_start.sh ./
COPY api/. api/
COPY config/. config/
COPY controllers/. controllers/
COPY models/. models/
COPY utils/. utils/
COPY certs/. certs/
COPY validators/. validators/
COPY service_info/. service_info/
COPY request_forwarding/. request_forwarding/
COPY request/. request/.
COPY protection/. protection/

EXPOSE 5000
EXPOSE 5043

#CMD [ "npm", "start" ]
CMD [ "./config_and_start.sh" ]

# For the image build: $ docker build -t witdom-core-broker .
# For the container run: $ docker run --name broker --env-file <file.env> -p 5000:5000 -p 5043:5043 --link mongo-container-name:mongo -d witdom-core-broker
