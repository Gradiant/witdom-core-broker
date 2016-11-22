# Contents of the Broker mock example orchestration module

## Directory listing
The orchestration example module contains the following directories and files (not all the files in subdirectories are listed):
 - lib
   - mock.js (Main file with all the internal logic and API offered functions)
   - mockError.js (Definition of the error launched by the module)
 - tests (Folder with example unit tests)
 - index.js (Main loadable file)
 - package.json
 - README.md (this file)

## API functions
 - connect (initializes the connection and loads configuration)
 - getServiceData (gets the information of the service identified by the given service name)
 - getServiceList (gets the information of all the services deployed)

## New implementations
You can create your own implementations of this module, the only condition is to respect the API functionalities and module.exports structure.
The configuration will be loaded from the config module of the broker, it will be passed directly to this module, so you can create the structure you need.