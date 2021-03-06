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
 * Service
 */
@javax.annotation.Generated(value = "class io.swagger.codegen.languages.JavaClientCodegen", date = "2017-02-02T21:19:29.686+01:00")
public class Service   {
  @JsonProperty("service_id")
  private String serviceId = null;

  @JsonProperty("description")
  private String description = null;

  @JsonProperty("uri")
  private String uri = null;

  @JsonProperty("image")
  private String image = null;

  public Service serviceId(String serviceId) {
    this.serviceId = serviceId;
    return this;
  }

   /**
   * Unique identifier representing a specific service in WITDOM.
   * @return serviceId
  **/
  @ApiModelProperty(example = "null", required = true, value = "Unique identifier representing a specific service in WITDOM.")
  public String getServiceId() {
    return serviceId;
  }

  public void setServiceId(String serviceId) {
    this.serviceId = serviceId;
  }

  public Service description(String description) {
    this.description = description;
    return this;
  }

   /**
   * Description of the service.
   * @return description
  **/
  @ApiModelProperty(example = "null", required = true, value = "Description of the service.")
  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Service uri(String uri) {
    this.uri = uri;
    return this;
  }

   /**
   * URI of the service.
   * @return uri
  **/
  @ApiModelProperty(example = "null", required = true, value = "URI of the service.")
  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }

  public Service image(String image) {
    this.image = image;
    return this;
  }

   /**
   * Image URL representing the service.
   * @return image
  **/
  @ApiModelProperty(example = "null", required = true, value = "Image URL representing the service.")
  public String getImage() {
    return image;
  }

  public void setImage(String image) {
    this.image = image;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Service service = (Service) o;
    return Objects.equals(this.serviceId, service.serviceId) &&
        Objects.equals(this.description, service.description) &&
        Objects.equals(this.uri, service.uri) &&
        Objects.equals(this.image, service.image);
  }

  @Override
  public int hashCode() {
    return Objects.hash(serviceId, description, uri, image);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Service {\n");
    
    sb.append("    serviceId: ").append(toIndentedString(serviceId)).append("\n");
    sb.append("    description: ").append(toIndentedString(description)).append("\n");
    sb.append("    uri: ").append(toIndentedString(uri)).append("\n");
    sb.append("    image: ").append(toIndentedString(image)).append("\n");
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

