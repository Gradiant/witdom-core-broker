package eu.witdom.core.broker.client.api;

import eu.witdom.core.broker.client.ApiException;
import eu.witdom.core.broker.client.ApiClient;
import eu.witdom.core.broker.client.Configuration;
import eu.witdom.core.broker.client.Pair;

import javax.ws.rs.core.GenericType;

import eu.witdom.core.broker.client.model.Request;
import eu.witdom.core.broker.client.model.Error;
import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2016-10-25T13:02:25.359+02:00")
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
   * Forward request to a WITDOM domain
   * This request is processed by a remote part of the broker in other domain to create a service request there.
   * @param service Name of the service (required)
   * @return BigDecimal
   * @throws ApiException if fails to make API call
   */
  public BigDecimal forwardDomainPOST(Request service) throws ApiException {
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
      "application/json"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };

    GenericType<BigDecimal> localVarReturnType = new GenericType<BigDecimal>() {};
    return apiClient.invokeAPI(localVarPath, "POST", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
}
