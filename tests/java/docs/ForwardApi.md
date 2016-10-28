# ForwardApi

All URIs are relative to *https://localhost/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**forwardDomainPOST**](ForwardApi.md#forwardDomainPOST) | **POST** /forward/domain | Forward request to a WITDOM domain


<a name="forwardDomainPOST"></a>
# **forwardDomainPOST**
> String forwardDomainPOST(service)

Forward request to a WITDOM domain

This request allows the broker to forward one request to the broker in the untrusted domain, where the target service is located. This path can only be accessed from a trusted component, so a valid client certificate must be present on the request.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.ForwardApi;


ForwardApi apiInstance = new ForwardApi();
Request service = new Request(); // Request | Name of the service
try {
    String result = apiInstance.forwardDomainPOST(service);
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

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

