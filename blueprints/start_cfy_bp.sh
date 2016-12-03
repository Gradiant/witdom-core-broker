
BP=${1:-1}

cfy blueprints upload -p bp$BP/blueprint.yaml -b witdom$BP
cfy deployments create -b witdom$BP -d witdom$BP
cfy executions start -w install -d witdom$BP

