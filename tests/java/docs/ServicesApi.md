# ServicesApi

All URIs are relative to *https://localhost/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**serviceDetailsGET**](ServicesApi.md#serviceDetailsGET) | **GET** /service/details | Details like location of a specific services
[**serviceDomainlistGET**](ServicesApi.md#serviceDomainlistGET) | **GET** /service/domainlist | List of services available in the domain
[**serviceListGET**](ServicesApi.md#serviceListGET) | **GET** /service/list | List of services available in WITDOM
[**serviceOutsidelistGET**](ServicesApi.md#serviceOutsidelistGET) | **GET** /service/outsidelist | Time Estimates


<a name="serviceDetailsGET"></a>
# **serviceDetailsGET**
> Service serviceDetailsGET(service, user, token)

Details like location of a specific services

With this request the client can get the details of the service identified by the given service  name, if exists.  This method can be accessed by client apps and internal services or even by the broker on  the other domain, so both a valid certificate and a valid token can be used to get access authorization. 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
String service = "service_example"; // String | Name of the service
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
try {
    Service result = apiInstance.serviceDetailsGET(service, user, token);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ServicesApi#serviceDetailsGET");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **service** | **String**| Name of the service |
 **user** | **String**| user name | [optional]
 **token** | **String**| Token of the user | [optional]

### Return type

[**Service**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="serviceDomainlistGET"></a>
# **serviceDomainlistGET**
> List&lt;Service&gt; serviceDomainlistGET(user, token)

List of services available in the domain

This lists all the services located in the asked boker&#39;s domain and their data.  As the \\\&quot;/service/details\\\&quot; method, it accepts both a valid certificate and a valid token to grant access.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
try {
    List<Service> result = apiInstance.serviceDomainlistGET(user, token);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ServicesApi#serviceDomainlistGET");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| user name | [optional]
 **token** | **String**| Token of the user | [optional]

### Return type

[**List&lt;Service&gt;**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="serviceListGET"></a>
# **serviceListGET**
> List&lt;Service&gt; serviceListGET(user, token)

List of services available in WITDOM

This lists all the services deployed in the WITDOM domains and their data.  As the other service methods, it accepts both a valid certificate and a valid token to grant access.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
try {
    List<Service> result = apiInstance.serviceListGET(user, token);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ServicesApi#serviceListGET");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| user name | [optional]
 **token** | **String**| Token of the user | [optional]

### Return type

[**List&lt;Service&gt;**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="serviceOutsidelistGET"></a>
# **serviceOutsidelistGET**
> List&lt;Service&gt; serviceOutsidelistGET(user, token)

Time Estimates

This lists all the services located outside the asked boker&#39;s domain and their data.  Like the other service methods, it accepts both a valid certificate and a valid token to grant access.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
try {
    List<Service> result = apiInstance.serviceOutsidelistGET(user, token);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ServicesApi#serviceOutsidelistGET");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| user name | [optional]
 **token** | **String**| Token of the user | [optional]

### Return type

[**List&lt;Service&gt;**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

