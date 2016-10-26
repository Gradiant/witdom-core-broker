Create a config file with the following content and extension .json

```javascript
{
  "invokerPackage":"eu.witdom.core.broker.client",
  "apiPackage":"eu.witdom.core.broker.client.api",
  "modelPackage":"eu.witdom.core.broker.client.model",
  "library":"jersey2"
}
```


Invoke the swagger code generator to generate the API client for Java:

> java -jar modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate -i ~/path/to//swagger.yaml -l java -o ~/output/path -c config_file.json
