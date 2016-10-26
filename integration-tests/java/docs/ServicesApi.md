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
> Service serviceDetailsGET(service)

Details like location of a specific services

This request will throw as result the details of a service.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
String service = "service_example"; // String | Name of the service
try {
    Service result = apiInstance.serviceDetailsGET(service);
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

### Return type

[**Service**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="serviceDomainlistGET"></a>
# **serviceDomainlistGET**
> List&lt;Service&gt; serviceDomainlistGET()

List of services available in the domain

This request throws as a result the list of all the services and modules associated with the deployment manager of the trusted domain.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
try {
    List<Service> result = apiInstance.serviceDomainlistGET();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ServicesApi#serviceDomainlistGET");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**List&lt;Service&gt;**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="serviceListGET"></a>
# **serviceListGET**
> List&lt;Service&gt; serviceListGET()

List of services available in WITDOM

This request will throw as result a list of all the services and modules deployed in WITDOM

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
try {
    List<Service> result = apiInstance.serviceListGET();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ServicesApi#serviceListGET");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**List&lt;Service&gt;**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="serviceOutsidelistGET"></a>
# **serviceOutsidelistGET**
> List&lt;Service&gt; serviceOutsidelistGET()

Time Estimates

This request throws as a result the list of all the services and modules associated with the deployment manager outside the trusted domain.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ServicesApi;


ServicesApi apiInstance = new ServicesApi();
try {
    List<Service> result = apiInstance.serviceOutsidelistGET();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ServicesApi#serviceOutsidelistGET");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**List&lt;Service&gt;**](Service.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

