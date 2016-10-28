# RequestApi

All URIs are relative to *https://localhost/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**requestCallbackPOST**](RequestApi.md#requestCallbackPOST) | **POST** /request/callback | Update a request
[**requestCreateBlockerPOST**](RequestApi.md#requestCreateBlockerPOST) | **POST** /request/create_blocker | Forwards a request to a service or module in a blocking manner
[**requestCreatePOST**](RequestApi.md#requestCreatePOST) | **POST** /request/create | Forwarding a request to a service or module
[**requestGetresultGET**](RequestApi.md#requestGetresultGET) | **GET** /request/getresult | Try to get the result of a previous request if available


<a name="requestCallbackPOST"></a>
# **requestCallbackPOST**
> Result requestCallbackPOST(service, requestId)

Update a request

The broker expects the service to send the results of the request started by the client here. Once the service ends an asyncronous request started by the broker, it will need to send the  result through this method to allow the broker to forward it to the client application.  This method can only be accesed by internal services, so it&#39;s required to provide a valid  certificate signed by the witdom CA. 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
Result service = new Result(); // Result | Name of the service
String requestId = "requestId_example"; // String | Number to identify the request referenced
try {
    Result result = apiInstance.requestCallbackPOST(service, requestId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling RequestApi#requestCallbackPOST");
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

<a name="requestCreateBlockerPOST"></a>
# **requestCreateBlockerPOST**
> Result requestCreateBlockerPOST(service, user, token)

Forwards a request to a service or module in a blocking manner

This requests works the same as /request/create, the main difference is that this one will not answer with a request_id, but with the result of the operations performed by the target service. This means that the connection will be open until the service ends the requested operations and may reach timeout if the operations take to long. The access authorization remains the same, it can be accessed with a valid certificate or a valid token. 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
Request service = new Request(); // Request | Name of the service
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
try {
    Result result = apiInstance.requestCreateBlockerPOST(service, user, token);
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
 **user** | **String**| user name | [optional]
 **token** | **String**| Token of the user | [optional]

### Return type

[**Result**](Result.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="requestCreatePOST"></a>
# **requestCreatePOST**
> String requestCreatePOST(service, user, token)

Forwarding a request to a service or module

With this request starts the forwarding process; where the broker will locate the target service and will perform the previous steps (like moving the data to the untrusted domain) needed to allow the service to do the requested operations.   The broker will answer with a request_id which should be used to later request the operations result or state.   To access this path a external client must provide a valid user token granted by theIAM. For an internal module/service, it&#39;s fine to provide a valid certificate signed by the witdom CA.

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
Request service = new Request(); // Request | Name of the service
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
try {
    String result = apiInstance.requestCreatePOST(service, user, token);
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
 **user** | **String**| user name | [optional]
 **token** | **String**| Token of the user | [optional]

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="requestGetresultGET"></a>
# **requestGetresultGET**
> Result requestGetresultGET(requestId, user, token)

Try to get the result of a previous request if available

Recovers the result of the request identified by the provided request_id. If the request  still being processed by the service, the broker will send a response with the actual status  of the request; ie, the service which is processing the data in that moment. The client  aplication will need to periodically request this info until if gets the result.  To access this data the client will need to present its credentials; a valid user and token  pair or a certificate signed by the witdom CA. 

### Example
```java
// Import classes:
//import eu.witdom.core.broker.client.ApiException;
//import eu.witdom.core.broker.client.api.RequestApi;


RequestApi apiInstance = new RequestApi();
String requestId = "requestId_example"; // String | Number to identify the request referenced
String user = "user_example"; // String | user name
String token = "token_example"; // String | Token of the user
try {
    Result result = apiInstance.requestGetresultGET(requestId, user, token);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling RequestApi#requestGetresultGET");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **requestId** | **String**| Number to identify the request referenced |
 **user** | **String**| user name | [optional]
 **token** | **String**| Token of the user | [optional]

### Return type

[**Result**](Result.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

