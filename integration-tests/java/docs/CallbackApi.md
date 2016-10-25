# CallbackApi

All URIs are relative to *https://localhost/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**callbackErrorPOST**](CallbackApi.md#callbackErrorPOST) | **POST** /callback/error | Update a request
[**callbackSuccessPOST**](CallbackApi.md#callbackSuccessPOST) | **POST** /callback/success | Update a request


<a name="callbackErrorPOST"></a>
# **callbackErrorPOST**
> Result callbackErrorPOST(service, requestId)

Update a request

An error occurred during the execution of a previous request 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.CallbackApi;


CallbackApi apiInstance = new CallbackApi();
Result service = new Result(); // Result | Name of the service
String requestId = "requestId_example"; // String | Number to identify the request referenced
try {
    Result result = apiInstance.callbackErrorPOST(service, requestId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CallbackApi#callbackErrorPOST");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **service** | [**Result**](Result.md)| Name of the service |
 **requestId** | **String**| Number to identify the request referenced |

### Return type

[**Result**](Result.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="callbackSuccessPOST"></a>
# **callbackSuccessPOST**
> Result callbackSuccessPOST(service, requestId)

Update a request

Post the result of a previous request 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.CallbackApi;


CallbackApi apiInstance = new CallbackApi();
Result service = new Result(); // Result | Name of the service
String requestId = "requestId_example"; // String | Number to identify the request referenced
try {
    Result result = apiInstance.callbackSuccessPOST(service, requestId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CallbackApi#callbackSuccessPOST");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **service** | [**Result**](Result.md)| Name of the service |
 **requestId** | **String**| Number to identify the request referenced |

### Return type

[**Result**](Result.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

