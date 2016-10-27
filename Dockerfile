FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/broker
WORKDIR /usr/src/broker

# Install app dependencies
COPY package.json /usr/src/broker
RUN npm install

# Bundle app source
COPY broker.js ./
COPY api/. api/
COPY config/. config/
COPY controllers/. controllers/
COPY utils/. utils/
COPY witdomCA/broker_key.pem witdomCA/broker_crt.pem witdomCA/witdomcacert.pem witdomCA/

EXPOSE 5000
EXPOSE 5043

CMD [ "npm", "start" ]

# For the image build: $ docker build -t witdom-core-broker .
# For the container run: $ docker run -p 5000:5000 -p 5043:5043 -d witdom-core-broker