package eu.witdom.core.broker.client.api;

import eu.witdom.core.broker.client.ApiException;
import eu.witdom.core.broker.client.ApiClient;
import eu.witdom.core.broker.client.Configuration;
import eu.witdom.core.broker.client.Pair;

import javax.ws.rs.core.GenericType;

import eu.witdom.core.broker.client.model.Error;
import eu.witdom.core.broker.client.model.Result;
import eu.witdom.core.broker.client.model.Request;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2016-10-27T22:07:14.105+02:00")
public class RequestApi {
  private ApiClient apiClient;

  public RequestApi() {
    this(Configuration.getDefaultApiClient());
  }

  public RequestApi(ApiClient apiClient) {
    this.apiClient = apiClient;
  }

  public ApiClient getApiClient() {
    return apiClient;
  }

  public void setApiClient(ApiClient apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Update a request
   * The broker expects the service to send the results of the request started by the client here. Once the service ends an asyncronous request started by the broker, it will need to send the  result through this method to allow the broker to forward it to the client application.  This method can only be accesed by internal services, so it&#39;s required to provide a valid  certificate signed by the witdom CA. 
   * @param service Name of the service (required)
   * @param requestId Number to identify the request referenced (required)
   * @return Result
   * @throws ApiException if fails to make API call
   */
  public Result requestCallbackPOST(Result service, String requestId) throws ApiException {
    Object localVarPostBody = service;
    
    // verify the required parameter 'service' is set
    if (service == null) {
      throw new ApiException(400, "Missing the required parameter 'service' when calling requestCallbackPOST");
    }
    
    // verify the required parameter 'requestId' is set
    if (requestId == null) {
      throw new ApiException(400, "Missing the required parameter 'requestId' when calling requestCallbackPOST");
    }
    
    // create path and map variables
    String localVarPath = "/request/callback".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();

    localVarQueryParams.addAll(apiClient.parameterToPairs("", "request_id", requestId));

    
    
    final String[] localVarAccepts = {
      "application/json"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };

    GenericType<Result> localVarReturnType = new GenericType<Result>() {};
    return apiClient.invokeAPI(localVarPath, "POST", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
  /**
   * Forwards a request to a service or module in a blocking manner
   * This requests works the same as /request/create, the main difference  is that this one will not answer with a request_id, but with the result of the operations  performed by the target service. This means that the connection will be open until the  service ends the requested operations and may reach timeout if the operations take to long.  The access authorization remains the same, it can be accessed with a valid certificate or  a valid token. 
   * @param service Name of the service (required)
   * @param user user name (optional)
   * @param token Token of the user (optional)
   * @return Result
   * @throws ApiException if fails to make API call
   */
  public Result requestCreateBlockerPOST(Request service, String user, String token) throws ApiException {
    Object localVarPostBody = service;
    
    // verify the required parameter 'service' is set
    if (service == null) {
      throw new ApiException(400, "Missing the required parameter 'service' when calling requestCreateBlockerPOST");
    }
    
    // create path and map variables
    String localVarPath = "/request/create_blocker".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();

    localVarQueryParams.addAll(apiClient.parameterToPairs("", "user", user));
    localVarQueryParams.addAll(apiClient.parameterToPairs("", "token", token));

    
    
    final String[] localVarAccepts = {
      "application/json"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };

    GenericType<Result> localVarReturnType = new GenericType<Result>() {};
    return apiClient.invokeAPI(localVarPath, "POST", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
  /**
   * Forwarding a request to a service or module
   * With this request starts the forwarding process; where the broker will locate the target service and will perform the previous steps (like moving the data to the untrusted domain) needed to allow the service to do the requested operations.   The broker will answer with a request_id which should be used to later request the operations result or state.   To access this path a external client must provide a valid user token granted by theIAM. For an internal module/service, it&#39;s fine to provide a valid certificate signed by the witdom CA.
   * @param service Name of the service (required)
   * @param user user name (optional)
   * @param token Token of the user (optional)
   * @return String
   * @throws ApiException if fails to make API call
   */
  public String requestCreatePOST(Request service, String user, String token) throws ApiException {
    Object localVarPostBody = service;
    
    // verify the required parameter 'service' is set
    if (service == null) {
      throw new ApiException(400, "Missing the required parameter 'service' when calling requestCreatePOST");
    }
    
    // create path and map variables
    String localVarPath = "/request/create".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();

    localVarQueryParams.addAll(apiClient.parameterToPairs("", "user", user));
    localVarQueryParams.addAll(apiClient.parameterToPairs("", "token", token));

    
    
    final String[] localVarAccepts = {
      "application/json"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };

    GenericType<String> localVarReturnType = new GenericType<String>() {};
    return apiClient.invokeAPI(localVarPath, "POST", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
  /**
   * Try to get the result of a previous request if available
   * Recovers the result of the request identified by the provided request_id. If the request  still being processed by the service, the broker will send a response with the actual status  of the request; ie, the service which is processing the data in that moment. The client  aplication will need to periodically request this info until if gets the result.  To access this data the client will need to present its credentials; a valid user and token  pair or a certificate signed by the witdom CA. 
   * @param user user name (required)
   * @param token Token of the user (required)
   * @param requestId Number to identify the request referenced (required)
   * @return Result
   * @throws ApiException if fails to make API call
   */
  public Result requestGetresultGET(String user, String token, String requestId) throws ApiException {
    Object localVarPostBody = null;
    
    // verify the required parameter 'user' is set
    if (user == null) {
      throw new ApiException(400, "Missing the required parameter 'user' when calling requestGetresultGET");
    }
    
    // verify the required parameter 'token' is set
    if (token == null) {
      throw new ApiException(400, "Missing the required parameter 'token' when calling requestGetresultGET");
    }
    
    // verify the required parameter 'requestId' is set
    if (requestId == null) {
      throw new ApiException(400, "Missing the required parameter 'requestId' when calling requestGetresultGET");
    }
    
    // create path and map variables
    String localVarPath = "/request/getresult".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();

    localVarQueryParams.addAll(apiClient.parameterToPairs("", "user", user));
    localVarQueryParams.addAll(apiClient.parameterToPairs("", "token", token));
    localVarQueryParams.addAll(apiClient.parameterToPairs("", "request_id", requestId));

    
    
    final String[] localVarAccepts = {
      "application/json"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };

    GenericType<Result> localVarReturnType = new GenericType<Result>() {};
    return apiClient.invokeAPI(localVarPath, "GET", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
}
