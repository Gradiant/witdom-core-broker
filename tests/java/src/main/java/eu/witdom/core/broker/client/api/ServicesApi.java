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

@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2016-10-27T22:07:14.105+02:00")
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
   * With this request the client can get the details of the service identified by the given service  name, if exists.  This method can be accessed by client apps and internal services or even by the broker on  the other domain, so both a valid certificate and a valid token can be used to get access authorization. 
   * @param service Name of the service (required)
   * @param xAuthToken The authentication token of the user (optional)
   * @return Service
   * @throws ApiException if fails to make API call
   */
  public Service serviceDetailsGET(String service, String xAuthToken) throws ApiException {
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

    localVarQueryParams.addAll(apiClient.parameterToPairs("", "service", service));

    if (xAuthToken != null)
      localVarHeaderParams.put("X-Auth-Token", apiClient.parameterToString(xAuthToken));

    
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
   * This lists all the services located in the asked broker&#39;s domain and their data.  As the \\\&quot;/service/details\\\&quot; method, it accepts both a valid certificate and a valid token to grant access. 
   * @param xAuthToken The authentication token of the user (optional)
   * @return List<Service>
   * @throws ApiException if fails to make API call
   */
  public List<Service> serviceDomainlistGET(String xAuthToken) throws ApiException {
    Object localVarPostBody = null;
    
    // create path and map variables
    String localVarPath = "/service/domainlist".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();


    if (xAuthToken != null)
      localVarHeaderParams.put("X-Auth-Token", apiClient.parameterToString(xAuthToken));

    
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
   * This lists all the services deployed in the WITDOM domains and their data.  As the other service methods, it accepts both a valid certificate and a valid token to grant access. 
   * @param xAuthToken The authentication token of the user (optional)
   * @return List<Service>
   * @throws ApiException if fails to make API call
   */
  public List<Service> serviceListGET(String xAuthToken) throws ApiException {
    Object localVarPostBody = null;
    
    // create path and map variables
    String localVarPath = "/service/list".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();


    if (xAuthToken != null)
      localVarHeaderParams.put("X-Auth-Token", apiClient.parameterToString(xAuthToken));

    
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
   * List of the services available outside this broker&#39;s domain
   * This lists all the services located outside the asked broker&#39;s domain and their data.  Like the other service methods, it accepts both a valid certificate and a valid token to grant access. 
   * @param xAuthToken The authentication token of the user (optional)
   * @return List<Service>
   * @throws ApiException if fails to make API call
   */
  public List<Service> serviceOutsidelistGET(String xAuthToken) throws ApiException {
    Object localVarPostBody = null;
    
    // create path and map variables
    String localVarPath = "/service/outsidelist".replaceAll("\\{format\\}","json");

    // query params
    List<Pair> localVarQueryParams = new ArrayList<Pair>();
    Map<String, String> localVarHeaderParams = new HashMap<String, String>();
    Map<String, Object> localVarFormParams = new HashMap<String, Object>();


    if (xAuthToken != null)
      localVarHeaderParams.put("X-Auth-Token", apiClient.parameterToString(xAuthToken));

    
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
