#!/bin/bash

## Set default config when it is not set through environment variables

if [ -z "$BROKER_HTTP_PORT" ]; then
    BROKER_HTTP_PORT="5000"
fi

if [ -z "$BROKER_HTTPS_PORT" ]; then
    BROKER_HTTPS_PORT="5043"
fi

if [ -z "$BROKER_CERT" ]; then
    BROKER_CERT="certs/broker_td_crt.pem"
fi

if [ -z "$BROKER_KEY" ]; then
    BROKER_KEY="certs/broker_td_key.pem"
fi

if [ -z "$BROKER_KEY_PASSPHRASE" ]; then
    BROKER_KEY_PASSPHRASE="W1td0mBr0k3r"
fi

if [ -z "$CA_CERT" ]; then
    CA_CERT="certs/witdomcacert.pem"
fi

if [ -z "$BROKER_PROTOCOL" ]; then
    BROKER_PROTOCOL="http"
fi

if [ -z "$BROKER_ED_HOST" ]; then
    BROKER_ED_HOST="broker-ud"
fi

if [ -z "$BROKER_ED_HTTP_PORT" ]; then
    BROKER_ED_HTTP_PORT="5000"
fi

if [ -z "$BROKER_ED_HTTPS_PORT" ]; then
    BROKER_ED_HTTPS_PORT="5043"
fi

if [ -z "$IAM_HOST" ]; then
    IAM_HOST="iam"
fi

if [ -z "$IAM_PORT" ]; then
    IAM_PORT="5000"
fi

if [ -z "$IAM_PROTOCOL" ]; then
    IAM_PROTOCOL="http"
fi
if [ -z "$IAM_ADMIN_USER" ]; then
    IAM_ADMIN_USER="admin"
fi

if [ -z "$IAM_ADMIN_PASSWORD" ]; then
    IAM_ADMIN_PASSWORD="adminpw"
fi

if [ -z "$MONGO_HOST" ]; then
    MONGO_HOST="mongo"
fi

if [ -z "$MONGO_PORT" ]; then
    MONGO_PORT="27017"
fi

if [ -z "$ORCHESTRATOR" ]; then
    ORCHESTRATOR="mock_example"
fi

if [ "$ORCHESTRATOR" == "cloudify_provider_connector" ]; then
    if [ -z "$CLOUDIFY_HOST" ]; then
        CLOUDIFY_HOST="cloudify"
    fi
    if [ -z "$CLOUDIFY_PORT" ]; then
        CLOUDIFY_PORT="80"
    fi
    ORCHESTRATOR_CONFIG="{host: '${CLOUDIFY_HOST}', port: '${CLOUDIFY_PORT}'}"
elif [ "$ORCHESTRATOR" == "mock_example" ]; then
    if [ -z "$MOCK_SERVICES" ]; then
        ORCHESTRATOR_CONFIG="services: {}"
    else
        ORCHESTRATOR_CONFIG="services: {${MOCK_SERVICES}}"
    fi
fi


## Write the custom configuration file

cat << EOF > custom_config.js

module.exports = {
    http: { port: ${BROKER_HTTP_PORT} },
    https: {
        port: ${BROKER_HTTPS_PORT},
        broker_key: '${BROKER_KEY}',
        broker_key_passphrase: '${BROKER_KEY_PASSPHRASE}',
        broker_cert: '${BROKER_CERT}',
        ca_cert: '${CA_CERT}'
    },
    protocol: "${BROKER_PROTOCOL}",
    broker_ed : { //broker external domain
        domain_name: "${BROKER_ED_HOST}",
        http: {
            port: ${BROKER_ED_HTTP_PORT}
        },
        https: {
            port: ${BROKER_ED_HTTPS_PORT}
        },
        http_port: ${BROKER_ED_HTTP_PORT},
        https_port: ${BROKER_ED_HTTPS_PORT}
    },
    tokenValidationService: {
        admin: {
            user: "${IAM_ADMIN_USER}",
            pass: "${IAM_ADMIN_PASSWORD}"
        },
        endpoint: "${IAM_PROTOCOL}://${IAM_HOST}:${IAM_PORT}/v3"
    },
    database: {
        host: '${MONGO_HOST}',
        port: '${MONGO_PORT}'
    },
    orchestrator: {
        name: '${ORCHESTRATOR}',
        config: {
            ${ORCHESTRATOR_CONFIG}
        }   
    }
};


EOF


## Start the Broker using the created custom configuration file

cat custom_config.js

npm start -- custom_config.js