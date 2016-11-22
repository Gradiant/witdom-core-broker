FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/broker
WORKDIR /usr/src/broker

# Copy andnstall app dependencies
COPY package.json /usr/src/broker
COPY orchestration/. orchestration/
RUN npm install

# Bundle app source
COPY broker.js ./
COPY api/. api/
COPY config/. config/
COPY controllers/. controllers/
COPY models/. models/
COPY utils/. utils/
COPY certs/. certs/

EXPOSE 5000
EXPOSE 5043

CMD [ "npm", "start" ]

# For the image build: $ docker build -t witdom-core-broker .
# For the container run: $ docker run --name broker -p 5000:5000 -p 5043:5043 --link mongo-container-name:mongo -d witdom-core-broker