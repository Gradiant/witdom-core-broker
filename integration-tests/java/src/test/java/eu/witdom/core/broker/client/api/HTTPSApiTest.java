/**
 * WITDOM Broker API API to use services from the Broker
 *
 * OpenAPI spec version: 1.0.0
 *
 * This is a test is intented for testing the access to the broker with HTTPS,
 * and the client authentication with certificate
 */
package eu.witdom.core.broker.client.api;

import eu.witdom.core.broker.client.ApiClient;
import eu.witdom.core.broker.client.ApiException;
import eu.witdom.core.broker.client.model.Request;
import eu.witdom.core.broker.client.model.Error;
import java.math.BigDecimal;
import org.junit.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Objects;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import org.glassfish.jersey.client.ClientConfig;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.filter.LoggingFilter;
import eu.witdom.core.broker.client.JSON;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import eu.witdom.core.broker.client.ssl.AliasedX509ExtendedKeyManager;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509KeyManager;

/**
 * API tests for ForwardApi
 */
public class HTTPSApiTest {

    String basePath = "https://localhost:5043/v1";
//    private ApiClient client = new ApiClient().setBasePath(basePath).setHttpClient(buildHttpsClient(true));
    private ApiClient client = new ApiClient().setBasePath(basePath);
    private final ForwardApi api = new ForwardApi(client);

    /**
     * This code is now implemented in the class SSLContextManager
     * This function will be removed before uploading the code to gitlab
     * @param debugging
     * @return
     * @deprecated
     */
    @Deprecated
    private Client buildHttpsClient(boolean debugging) {
        final ClientConfig clientConfig = new ClientConfig();
        JSON json = new JSON();
        clientConfig.register(MultiPartFeature.class);
        clientConfig.register(json);
        clientConfig.register(JacksonFeature.class);
        if (debugging) {
            clientConfig.register(LoggingFilter.class);
        }
        
        System.out.println(System.getProperty("javax.net.ssl.trustStoreType"));
        System.out.println(System.getProperty("javax.net.ssl.trustStore"));
        System.out.println(System.getProperty("javax.net.ssl.trustStorePassword"));
        System.out.println(System.getProperty("javax.net.ssl.keyStoreType"));
        System.out.println(System.getProperty("javax.net.ssl.keyStore"));
        System.out.println(System.getProperty("javax.net.ssl.keyStorePassword"));
        System.out.println("https.protocols: " + System.getProperty("https.protocols"));
        System.out.println(System.getProperty("java.version"));
        KeyStore truststore = null;
        java.io.FileInputStream fis = null;
        try {
            truststore = KeyStore.getInstance(System.getProperty("javax.net.ssl.trustStoreType", "JKS"));
            fis = new FileInputStream(System.getProperty("javax.net.ssl.trustStore",""));
            truststore.load(fis, System.getProperty("javax.net.ssl.trustStorePassword", "").toCharArray());
        } catch (KeyStoreException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            truststore = null;
        } catch (FileNotFoundException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            truststore = null;
        } catch (IOException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            truststore = null;
        } catch (NoSuchAlgorithmException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            truststore = null;
        } catch (CertificateException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            truststore = null;
        }  finally {
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException ex) {
                    
                }
            }
        }
        KeyStore keystore = null;
        fis = null;
        try {
            keystore = KeyStore.getInstance(System.getProperty("javax.net.ssl.trustStoreType","JKS"));
            fis = new FileInputStream(System.getProperty("javax.net.ssl.keyStore",""));
            keystore.load(fis, System.getProperty("javax.net.ssl.trustStorePassword","").toCharArray());
        } catch (KeyStoreException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        } catch (FileNotFoundException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        } catch (NoSuchAlgorithmException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        } catch (CertificateException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        }  finally {
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException ex) {
                    
                }
            }
        }
               
        TrustManagerFactory tmf = null;
        try {
            tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(truststore);
           

        } catch (NoSuchAlgorithmException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        } catch (KeyStoreException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        KeyManagerFactory kmf = null;
        try {
            kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            kmf.init(keystore, System.getProperty("javax.net.ssl.trustStorePassword","").toCharArray());
        } catch (NoSuchAlgorithmException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            kmf = null;
        } catch (KeyStoreException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            kmf = null;
        } catch (UnrecoverableKeyException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
            kmf = null;
        }
        
        TrustManager[] tms = null;
        if (tmf != null) {
            tms = tmf.getTrustManagers();
            for (TrustManager tm : tms) {
                System.out.println(tm.getClass().toString());
            }
        }
        
        KeyManager[] kms = null;
        if (kmf != null) {
            kms = kmf.getKeyManagers();
            for (int i=0;i<kms.length;++i) {
                KeyManager km = kms[i];
                System.out.println(km.getClass().toString());
                if (km instanceof X509KeyManager) {
                    try {
                        kms[i] = new AliasedX509ExtendedKeyManager(System.getProperty("clientCertificateAlias", null), (X509KeyManager)km);
                    } catch (Exception ex) {
                        Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
                    }
                }
            }
        }
        
        SSLContext ctx = null;
        
       try {
            ctx = SSLContext.getInstance("TLSv1");
        } catch (Exception ex) {

        }
        
        try {
            ctx.init(kms, tms, new SecureRandom());
        } catch (KeyManagementException ex) {
            Logger.getLogger(HTTPSApiTest.class.getName()).log(Level.SEVERE, null, ex);
        }
        return ClientBuilder.newBuilder().withConfig(clientConfig).sslContext(ctx).build();
    }

    /**
     * Forward request to a WITDOM domain
     *
     * This request is processed by a remote part of the broker in other domain
     * to create a service request there.
     *
     * @throws ApiException if the Api call fails
     */
    @Test
    public void forwardDomainPOSTTest() throws ApiException {

        Request request = new Request();

        request.setServiceName("string");

        request.setRequestType("string");

        request.setRequestUri("string");

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode objectNode = mapper.createObjectNode();
        objectNode.put("data", "String");
        request.setRequestData(objectNode);

        BigDecimal response = api.forwardDomainPOST(request);

        // TODO: test validations
    }

}
