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
 * ForwardCallback
 */
@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2017-02-02T21:19:29.686+01:00")
public class ForwardCallback   {
  @JsonProperty("request_id")
  private String requestId = null;

  @JsonProperty("response_status")
  private Integer responseStatus = null;

  @JsonProperty("response_headers")
  private Object responseHeaders = null;

  @JsonProperty("response_data")
  private Object responseData = null;

  public ForwardCallback requestId(String requestId) {
    this.requestId = requestId;
    return this;
  }

   /**
   * Request identifier
   * @return requestId
  **/
  @ApiModelProperty(example = "null", required = true, value = "Request identifier")
  public String getRequestId() {
    return requestId;
  }

  public void setRequestId(String requestId) {
    this.requestId = requestId;
  }

  public ForwardCallback responseStatus(Integer responseStatus) {
    this.responseStatus = responseStatus;
    return this;
  }

   /**
   * http status code
   * @return responseStatus
  **/
  @ApiModelProperty(example = "null", required = true, value = "http status code")
  public Integer getResponseStatus() {
    return responseStatus;
  }

  public void setResponseStatus(Integer responseStatus) {
    this.responseStatus = responseStatus;
  }

  public ForwardCallback responseHeaders(Object responseHeaders) {
    this.responseHeaders = responseHeaders;
    return this;
  }

   /**
   * A set of HTTP headers to pass to the service/module when sending the response
   * @return responseHeaders
  **/
  @ApiModelProperty(example = "null", required = true, value = "A set of HTTP headers to pass to the service/module when sending the response")
  public Object getResponseHeaders() {
    return responseHeaders;
  }

  public void setResponseHeaders(Object responseHeaders) {
    this.responseHeaders = responseHeaders;
  }

  public ForwardCallback responseData(Object responseData) {
    this.responseData = responseData;
    return this;
  }

   /**
   * JSON with the parameters of the response\"
   * @return responseData
  **/
  @ApiModelProperty(example = "null", required = true, value = "JSON with the parameters of the response\"")
  public Object getResponseData() {
    return responseData;
  }

  public void setResponseData(Object responseData) {
    this.responseData = responseData;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ForwardCallback forwardCallback = (ForwardCallback) o;
    return Objects.equals(this.requestId, forwardCallback.requestId) &&
        Objects.equals(this.responseStatus, forwardCallback.responseStatus) &&
        Objects.equals(this.responseHeaders, forwardCallback.responseHeaders) &&
        Objects.equals(this.responseData, forwardCallback.responseData);
  }

  @Override
  public int hashCode() {
    return Objects.hash(requestId, responseStatus, responseHeaders, responseData);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ForwardCallback {\n");
    
    sb.append("    requestId: ").append(toIndentedString(requestId)).append("\n");
    sb.append("    responseStatus: ").append(toIndentedString(responseStatus)).append("\n");
    sb.append("    responseHeaders: ").append(toIndentedString(responseHeaders)).append("\n");
    sb.append("    responseData: ").append(toIndentedString(responseData)).append("\n");
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
