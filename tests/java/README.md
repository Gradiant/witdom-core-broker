# swagger-java-client

## Requirements

Building the API client library requires [Maven](https://maven.apache.org/) to be installed.

## Installation

To install the API client library to your local Maven repository, simply execute:

```shell
mvn install
```

To deploy it to a remote Maven repository instead, configure the settings of the repository and execute:

```shell
mvn deploy
```

Refer to the [official documentation](https://maven.apache.org/plugins/maven-deploy-plugin/usage.html) for more information.

### Maven users

Add this dependency to your project's POM:

```xml
<dependency>
    <groupId>io.swagger</groupId>
    <artifactId>swagger-java-client</artifactId>
    <version>1.0.0</version>
    <scope>compile</scope>
</dependency>
```

### Gradle users

Add this dependency to your project's build file:

```groovy
compile "io.swagger:swagger-java-client:1.0.0"
```

### Others

At first generate the JAR by executing:

    mvn package

Then manually install the following JARs:

* target/swagger-java-client-1.0.0.jar
* target/lib/*.jar

## Getting Started

Please follow the [installation](#installation) instruction and execute the following Java code:

```java

import eu.witdom.core.broker.client.*;
import eu.witdom.core.broker.client.auth.*;
import eu.witdom.core.broker.client.model.*;
import eu.witdom.core.broker.client.api.ForwardApi;

import java.io.File;
import java.util.*;

public class ForwardApiExample {

    public static void main(String[] args) {
        
        ForwardApi apiInstance = new ForwardApi();
        Request service = new Request(); // Request | Name of the service
        try {
            String result = apiInstance.forwardDomainPOST(service);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling ForwardApi#forwardDomainPOST");
            e.printStackTrace();
        }
    }
}

```

## Documentation for API Endpoints

All URIs are relative to *https://localhost/v1*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*ForwardApi* | [**forwardDomainPOST**](docs/ForwardApi.md#forwardDomainPOST) | **POST** /forward/domain | Forward request to a WITDOM domain
*RequestApi* | [**requestCallbackPOST**](docs/RequestApi.md#requestCallbackPOST) | **POST** /request/callback | Update a request
*RequestApi* | [**requestCreateBlockerPOST**](docs/RequestApi.md#requestCreateBlockerPOST) | **POST** /request/create_blocker | Forwards a request to a service or module in a blocking manner
*RequestApi* | [**requestCreatePOST**](docs/RequestApi.md#requestCreatePOST) | **POST** /request/create | Forwarding a request to a service or module
*RequestApi* | [**requestGetresultGET**](docs/RequestApi.md#requestGetresultGET) | **GET** /request/getresult | Try to get the result of a previous request if available
*ServicesApi* | [**serviceDetailsGET**](docs/ServicesApi.md#serviceDetailsGET) | **GET** /service/details | Details like location of a specific services
*ServicesApi* | [**serviceDomainlistGET**](docs/ServicesApi.md#serviceDomainlistGET) | **GET** /service/domainlist | List of services available in the domain
*ServicesApi* | [**serviceListGET**](docs/ServicesApi.md#serviceListGET) | **GET** /service/list | List of services available in WITDOM
*ServicesApi* | [**serviceOutsidelistGET**](docs/ServicesApi.md#serviceOutsidelistGET) | **GET** /service/outsidelist | Time Estimates


## Documentation for Models

 - [Error](docs/Error.md)
 - [Request](docs/Request.md)
 - [Result](docs/Result.md)
 - [Service](docs/Service.md)


## Documentation for Authorization

All endpoints do not require authorization.
Authentication schemes defined for the API:

## Recommendation

It's recommended to create an instance of `ApiClient` per thread in a multithreaded environment to avoid any potential issue.

## Author



