/**
 * WITDOM Broker API
 * API to use services from the Broker
 *
 * OpenAPI spec version: 1.5.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


package eu.witdom.core.broker.client.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;


/**
 * ForwardRequest
 */
@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2017-02-02T21:19:29.686+01:00")
public class ForwardRequest   {
  @JsonProperty("request_id")
  private String requestId = null;

  @JsonProperty("service_name")
  private String serviceName = null;

  @JsonProperty("request_type")
  private String requestType = null;

  @JsonProperty("request_uri")
  private String requestUri = null;

  @JsonProperty("request_headers")
  private Object requestHeaders = null;

  @JsonProperty("request_data")
  private Object requestData = null;

  public ForwardRequest requestId(String requestId) {
    this.requestId = requestId;
    return this;
  }

   /**
   * ID of the request that is being forwared to the domain. This ID will be used in the invocation of the method forward/callback when the request is completed.
   * @return requestId
  **/
  @ApiModelProperty(example = "null", required = true, value = "ID of the request that is being forwared to the domain. This ID will be used in the invocation of the method forward/callback when the request is completed.")
  public String getRequestId() {
    return requestId;
  }

  public void setRequestId(String requestId) {
    this.requestId = requestId;
  }

  public ForwardRequest serviceName(String serviceName) {
    this.serviceName = serviceName;
    return this;
  }

   /**
   * Name representing a specific service in WITDOM.
   * @return serviceName
  **/
  @ApiModelProperty(example = "null", required = true, value = "Name representing a specific service in WITDOM.")
  public String getServiceName() {
    return serviceName;
  }

  public void setServiceName(String serviceName) {
    this.serviceName = serviceName;
  }

  public ForwardRequest requestType(String requestType) {
    this.requestType = requestType;
    return this;
  }

   /**
   * get or post
   * @return requestType
  **/
  @ApiModelProperty(example = "null", required = true, value = "get or post")
  public String getRequestType() {
    return requestType;
  }

  public void setRequestType(String requestType) {
    this.requestType = requestType;
  }

  public ForwardRequest requestUri(String requestUri) {
    this.requestUri = requestUri;
    return this;
  }

   /**
   * http/https call after IP and port of the service
   * @return requestUri
  **/
  @ApiModelProperty(example = "null", required = true, value = "http/https call after IP and port of the service")
  public String getRequestUri() {
    return requestUri;
  }

  public void setRequestUri(String requestUri) {
    this.requestUri = requestUri;
  }

  public ForwardRequest requestHeaders(Object requestHeaders) {
    this.requestHeaders = requestHeaders;
    return this;
  }

   /**
   * A set of HTTP headers to pass to the service/module when doing the request
   * @return requestHeaders
  **/
  @ApiModelProperty(example = "null", required = true, value = "A set of HTTP headers to pass to the service/module when doing the request")
  public Object getRequestHeaders() {
    return requestHeaders;
  }

  public void setRequestHeaders(Object requestHeaders) {
    this.requestHeaders = requestHeaders;
  }

  public ForwardRequest requestData(Object requestData) {
    this.requestData = requestData;
    return this;
  }

   /**
   * JSON with the parameters of the request in case request_type is POST
   * @return requestData
  **/
  @ApiModelProperty(example = "null", required = true, value = "JSON with the parameters of the request in case request_type is POST")
  public Object getRequestData() {
    return requestData;
  }

  public void setRequestData(Object requestData) {
    this.requestData = requestData;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ForwardRequest forwardRequest = (ForwardRequest) o;
    return Objects.equals(this.requestId, forwardRequest.requestId) &&
        Objects.equals(this.serviceName, forwardRequest.serviceName) &&
        Objects.equals(this.requestType, forwardRequest.requestType) &&
        Objects.equals(this.requestUri, forwardRequest.requestUri) &&
        Objects.equals(this.requestHeaders, forwardRequest.requestHeaders) &&
        Objects.equals(this.requestData, forwardRequest.requestData);
  }

  @Override
  public int hashCode() {
    return Objects.hash(requestId, serviceName, requestType, requestUri, requestHeaders, requestData);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ForwardRequest {\n");
    
    sb.append("    requestId: ").append(toIndentedString(requestId)).append("\n");
    sb.append("    serviceName: ").append(toIndentedString(serviceName)).append("\n");
    sb.append("    requestType: ").append(toIndentedString(requestType)).append("\n");
    sb.append("    requestUri: ").append(toIndentedString(requestUri)).append("\n");
    sb.append("    requestHeaders: ").append(toIndentedString(requestHeaders)).append("\n");
    sb.append("    requestData: ").append(toIndentedString(requestData)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
