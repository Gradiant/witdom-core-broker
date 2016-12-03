
BP=${1:-1}

cfy executions start -w uninstall -d witdom$BP
cfy deployments delete -d witdom$BP
cfy blueprints delete -b witdom$BP

