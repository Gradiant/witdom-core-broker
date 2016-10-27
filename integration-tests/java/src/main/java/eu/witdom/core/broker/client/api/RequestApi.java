package eu.witdom.core.broker.client.api;

import eu.witdom.core.broker.client.ApiException;
import eu.witdom.core.broker.client.ApiClient;
import eu.witdom.core.broker.client.Configuration;
import eu.witdom.core.broker.client.Pair;

import javax.ws.rs.core.GenericType;

import eu.witdom.core.broker.client.model.Request;
import eu.witdom.core.broker.client.model.Error;
import eu.witdom.core.broker.client.model.Result;
import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2016-10-25T13:02:25.359+02:00")
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
   * Forwards a request to a service or module in a blocking manner
   * The creation of a request just sends the request to the target service or module and blocks the return until available results
   * @param token Token of the user (required) 
   * @param service Name of the service (required)
   * @return Result
   * @throws ApiException if fails to make API call
   */
  public Result requestCreateBlockerPOST(String user, String token, Request service) throws ApiException {
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
   * The creation of a request just sends the request to the target service or module 
   * @param token Token of the user (required)
   * @param service Name of the service (required)
   * @return String
   * @throws ApiException if fails to make API call
   */
  public String requestCreatePOST(String user, String token, Request service) throws ApiException {
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
   * If the request_id is finished then returns the result if not returns an error. 
   * @param user user name (required)
   * @param token Token of the user
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
  /**
   * Update a request
   * The forward requests just send the request 
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
}
