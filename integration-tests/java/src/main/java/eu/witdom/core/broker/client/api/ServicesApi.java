package eu.witdom.core.broker.client.api;

import eu.witdom.core.broker.client.ApiException;
import eu.witdom.core.broker.client.ApiClient;
import eu.witdom.core.broker.client.Configuration;
import eu.witdom.core.broker.client.Pair;

import javax.ws.rs.core.GenericType;

import eu.witdom.core.broker.client.model.Service;
import eu.witdom.core.broker.client.model.Error;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2016-10-25T13:02:25.359+02:00")
public class ServicesApi {
  private ApiClient apiClient;

  public ServicesApi() {
    this(Configuration.getDefaultApiClient());
  }

  public ServicesApi(ApiClient apiClient) {
    this.apiClient = apiClient;
  }

  public ApiClient getApiClient() {
    return apiClient;
  }

  public void setApiClient(ApiClient apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Details like location of a specific services
   * This request will throw as result the details of a service.
   * @param token Token of the user (required)
   * @param service Name of the service (required)
   * @return Service
   * @throws ApiException if fails to make API call
   */
  public Service serviceDetailsGET(String user, String token, String service) throws ApiException {
    Object localVarPostBody = null;
    
    // verify the required parameter 'service' is set
    if (service == null) {
      throw new ApiException(400, "Missing the required parameter 'service' when calling serviceDetailsGET");
    }
    
    // create path and map variables
    String localVarPath = "/service/details".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();

    localVarQueryParams.addAll(apiClient.parameterToPairs("", "user", user));
    localVarQueryParams.addAll(apiClient.parameterToPairs("", "token", token));
    localVarQueryParams.addAll(apiClient.parameterToPairs("", "service", service));

    
    
    final String[] localVarAccepts = {
      "application/json"
    };
    final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);

    final String[] localVarContentTypes = {
      
    };
    final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

    String[] localVarAuthNames = new String[] {  };

    GenericType<Service> localVarReturnType = new GenericType<Service>() {};
    return apiClient.invokeAPI(localVarPath, "GET", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
  /**
   * List of services available in the domain
   * This request throws as a result the list of all the services and modules associated with the deployment manager of the trusted domain.
   * @param token Token of the user (required)
   * @return List<Service>
   * @throws ApiException if fails to make API call
   */
  public List<Service> serviceDomainlistGET(String user, String token) throws ApiException {
    Object localVarPostBody = null;
    
    // create path and map variables
    String localVarPath = "/service/domainlist".replaceAll("\\{format\\}","json");

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

    GenericType<List<Service>> localVarReturnType = new GenericType<List<Service>>() {};
    return apiClient.invokeAPI(localVarPath, "GET", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
  /**
   * List of services available in WITDOM
   * This request will throw as result a list of all the services and modules deployed in WITDOM
   * @param token Token of the user (required)
   * @return List<Service>
   * @throws ApiException if fails to make API call
   */
  public List<Service> serviceListGET(String user, String token) throws ApiException {
    Object localVarPostBody = null;
    
    // create path and map variables
    String localVarPath = "/service/list".replaceAll("\\{format\\}","json");

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

    GenericType<List<Service>> localVarReturnType = new GenericType<List<Service>>() {};
    return apiClient.invokeAPI(localVarPath, "GET", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
  /**
   * Time Estimates
   * This request throws as a result the list of all the services and modules associated with the deployment manager outside the trusted domain.
   * @param token Token of the user (required)
   * @return List<Service>
   * @throws ApiException if fails to make API call
   */
  public List<Service> serviceOutsidelistGET(String user, String token) throws ApiException {
    Object localVarPostBody = null;
    
    // create path and map variables
    String localVarPath = "/service/outsidelist".replaceAll("\\{format\\}","json");

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

    GenericType<List<Service>> localVarReturnType = new GenericType<List<Service>>() {};
    return apiClient.invokeAPI(localVarPath, "GET", localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
      }
}
