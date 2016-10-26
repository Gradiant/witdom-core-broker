# RequestApi

All URIs are relative to *https://localhost/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**requestCreateBlockerPOST**](RequestApi.md#requestCreateBlockerPOST) | **POST** /request/create_blocker | Forwards a request to a service or module in a blocking manner
[**requestCreatePOST**](RequestApi.md#requestCreatePOST) | **POST** /request/create | Forwarding a request to a service or module
[**requestGetresultGET**](RequestApi.md#requestGetresultGET) | **GET** /request/getresult | Try to get the result of a previous request if available
[**requestUpdatePOST**](RequestApi.md#requestUpdatePOST) | **POST** /request/update | Update a request


<a name="requestCreateBlockerPOST"></a>
# **requestCreateBlockerPOST**
> Result requestCreateBlockerPOST(service)

Forwards a request to a service or module in a blocking manner

The creation of a request just sends the request to the target service or module and blocks the return until available results 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
Request service = new Request(); // Request | Name of the service
try {
    Result result = apiInstance.requestCreateBlockerPOST(service);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling RequestApi#requestCreateBlockerPOST");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **service** | [**Request**](Request.md)| Name of the service |

### Return type

[**Result**](Result.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="requestCreatePOST"></a>
# **requestCreatePOST**
> BigDecimal requestCreatePOST(service)

Forwarding a request to a service or module

The creation of a request just sends the request to the target service or module 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
Request service = new Request(); // Request | Name of the service
try {
    BigDecimal result = apiInstance.requestCreatePOST(service);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling RequestApi#requestCreatePOST");
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

<a name="requestGetresultGET"></a>
# **requestGetresultGET**
> Result requestGetresultGET(user, token, requestId)

Try to get the result of a previous request if available

If the request_id is finished then returns the result if not returns an error. 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
String requestId = "requestId_example"; // String | Number to identify the request referenced
try {
    Result result = apiInstance.requestGetresultGET(user, token, requestId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling RequestApi#requestGetresultGET");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| user name |
 **token** | **String**| Token of the user |
 **requestId** | **String**| Number to identify the request referenced |

### Return type

[**Result**](Result.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="requestUpdatePOST"></a>
# **requestUpdatePOST**
> Result requestUpdatePOST(service, requestId)

Update a request

The forward requests just send the request 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
Result service = new Result(); // Result | Name of the service
String requestId = "requestId_example"; // String | Number to identify the request referenced
try {
    Result result = apiInstance.requestUpdatePOST(service, requestId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling RequestApi#requestUpdatePOST");
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

