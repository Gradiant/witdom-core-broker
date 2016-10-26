# ForwardApi

All URIs are relative to *https://localhost/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**forwardDomainPOST**](ForwardApi.md#forwardDomainPOST) | **POST** /forward/domain | Forward request to a WITDOM domain


<a name="forwardDomainPOST"></a>
# **forwardDomainPOST**
> BigDecimal forwardDomainPOST(service)

Forward request to a WITDOM domain

This request is processed by a remote part of the broker in other domain to create a service request there.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ForwardApi;


ForwardApi apiInstance = new ForwardApi();
Request service = new Request(); // Request | Name of the service
try {
    BigDecimal result = apiInstance.forwardDomainPOST(service);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ForwardApi#forwardDomainPOST");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **service** | [**Request**](Request.md)| Name of the service |

### Return type

[**BigDecimal**](BigDecimal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

