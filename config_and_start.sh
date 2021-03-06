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
    BROKER_KEY_PASSPHRASE="Gr4d14ntBr0k3r"
fi

if [ -z "$CA_CERTS" ]; then
    CA_CERTS="certs/tdcacert.pem"
fi

CA_CERTS_STRING=
OIFS=$IFS
IFS=','
for cert in $CA_CERTS
do
    if [ -z "$CA_CERTS_STRING" ]; then
        CA_CERTS_STRING=\'$cert\'
    else
        CA_CERTS_STRING=${CA_CERTS_STRING},\'$cert\'
    fi
done
IFS=$OIFS


if [ -z "$PROTOCOL" ]; then
    PROTOCOL="http"
fi

if [ -z "$TESTING" ]; then
    TESTING="true"
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

if [ -z "$AUDIT_ACTIVE" ]; then
    AUDIT_ACTIVE="true"
fi

if [ -z "$AUDIT_MONGO_HOST" ]; then
    AUDIT_MONGO_HOST="mongo"
fi

if [ -z "$AUDIT_MONGO_PORT" ]; then
    AUDIT_MONGO_PORT="27017"
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

if [ -z "$RETRIES" ]; then
    RETRIES="10"
fi

if [ -z "$PO_ID" ]; then
    PO_ID="po"
fi

if [ -z "$PO_CN" ]; then
    PO_CN="po"
fi

if [ -z "$PO_BASEPATH" ]; then
    PO_BASEPATH ='/v1'
fi

if [ -z "$LOGGING_LEVEL" ]; then
    LOGGING_LEVEL="silly"
fi

if [ -z "$PO_CONNECTOR" ]; then
    PO_CONNECTOR="./protection/po_connector"
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
        //ca_cert: '${CA_CERTS}'
        ca_certs: [${CA_CERTS_STRING}]
    },
    testing: ${TESTING},
    numberOfRetries: ${RETRIES},
    po_id: '${PO_ID}',
    po_cn: '${PO_CN}',
    po_connector: '$PO_CONNECTOR',
    po_basepath: '$PO_BASEPATH',
    protocol: "${PROTOCOL}",
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
    audit: {
        active: '${AUDIT_ACTIVE}',
        database: {
            host: '${AUDIT_MONGO_HOST}',
            port: '${AUDIT_MONGO_PORT}'
        }
    },
    orchestrator: {
        name: '${ORCHESTRATOR}',
        config: {
            ${ORCHESTRATOR_CONFIG}
        }   
    },
    logging_level: '${LOGGING_LEVEL}'
};


EOF


## Start the Broker using the created custom configuration file

npm start -- custom_config.js