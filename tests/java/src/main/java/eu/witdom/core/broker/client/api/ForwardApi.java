package eu.witdom.core.broker.client.api;

import eu.witdom.core.broker.client.ApiException;
import eu.witdom.core.broker.client.ApiClient;
import eu.witdom.core.broker.client.Configuration;
import eu.witdom.core.broker.client.Pair;

import javax.ws.rs.core.GenericType;

import eu.witdom.core.broker.client.model.Error;
import eu.witdom.core.broker.client.model.ForwardCallback;
import eu.witdom.core.broker.client.model.ForwardRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2016-10-27T22:07:14.105+02:00")
public class ForwardApi {
  private ApiClient apiClient;

  public ForwardApi() {
    this(Configuration.getDefaultApiClient());
  }

  public ForwardApi(ApiClient apiClient) {
    this.apiClient = apiClient;
  }

  public ApiClient getApiClient() {
    return apiClient;
  }

  public void setApiClient(ApiClient apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Forward request response to a WITDOM domain
   * This request allows the broker to forward one response to the  broker in the trusted domain, where the target application is located.  This path can only be accessed from a trusted component, so a valid client  certificate must be present on the request. 
   * @param service Service info and request data (required)
   * @throws ApiException if fails to make API call
   */
  public void forwardCallbackPOST(ForwardCallback service) throws ApiException {
    Object localVarPostBody = service;
    
    // verify the required parameter 'service' is set
    if (service == null) {
      throw new ApiException(400, "Missing the required parameter 'service' when calling forwardCallbackPOST");
    }
    
    // create path and map variables
    String localVarPath = "/forward/callback".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();


    
    
    final String[] localVarAccepts = {
      "application/json"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };


    apiClient.invokeAPI(localVarPath, "POST", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, null);
  }
  /**
   * Forward request to a WITDOM domain
   * This request allows the broker to forward one request to the  broker in the untrusted domain, where the target service is located.  This path can only be accessed from a trusted component, so a valid client  certificate must be present on the request. 
   * @param service Service info and request data (required)
   * @return String
   * @throws ApiException if fails to make API call
   */
  public String forwardDomainPOST(ForwardRequest service) throws ApiException {
    Object localVarPostBody = service;
    
    // verify the required parameter 'service' is set
    if (service == null) {
      throw new ApiException(400, "Missing the required parameter 'service' when calling forwardDomainPOST");
    }
    
    // create path and map variables
    String localVarPath = "/forward/domain".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();


    
    
    final String[] localVarAccepts = {
      "text/plain"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };

    GenericType<String> localVarReturnType = new GenericType<String>() {};
    return apiClient.invokeAPI(localVarPath, "POST", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
}
