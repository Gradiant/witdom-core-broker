package eu.witdom.core.broker.client.ssl;

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
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509KeyManager;

/**
 *
 * @author gjimenez
 */
public class SSLContextManager {

    private static SSLContext ctx = null;
    private static boolean initialized = false;

    public static SSLContext getSSLContext() {
        if (!initialized) {
            ctx = buildSSLContext();
            initialized = true;
        }
        return ctx;
    }

    private static SSLContext buildSSLContext() {
        try {
            if (System.getProperty("java.version").startsWith("1.8")) {
                ctx = SSLContext.getInstance("TLSv1");
                System.setProperty("https.protocols", "TLSv1");
            } else {
                ctx = SSLContext.getInstance("SSL");
            }
        } catch (NoSuchAlgorithmException ex) {
            return null;
        }
        KeyStore truststore = getTrustStore();
        KeyStore keystore = getKeyStore();
        TrustManagerFactory tmf = getTrustManagerFactory(truststore);
        KeyManagerFactory kmf = getKeyManagerFactory(keystore);

        TrustManager[] tms = (tmf != null) ? tmf.getTrustManagers() : null;
        KeyManager[] kms = (kmf != null) ? kmf.getKeyManagers() : null;
        for (int i = 0; i < kms.length; ++i) {
            KeyManager km = kms[i];
            if (km instanceof X509KeyManager) {
                kms[i] = new AliasedX509ExtendedKeyManager(System.getProperty("clientCertificateAlias", null), (X509KeyManager) km);

            }
        }
        
        try {
            ctx.init(kms, tms, new SecureRandom());
        } catch (KeyManagementException ex) {
            return null;
        }

        return ctx;
    }

    private static KeyStore getTrustStore() {
        KeyStore truststore = null;
        java.io.FileInputStream fis = null;
        try {
            truststore = KeyStore.getInstance(System.getProperty("javax.net.ssl.trustStoreType", "JKS"));
            fis = new FileInputStream(System.getProperty("javax.net.ssl.trustStore", ""));
            truststore.load(fis, System.getProperty("javax.net.ssl.trustStorePassword", "").toCharArray());
        } catch (KeyStoreException ex) {
            truststore = null;
        } catch (FileNotFoundException ex) {
            truststore = null;
        } catch (IOException ex) {
            truststore = null;
        } catch (NoSuchAlgorithmException ex) {
            truststore = null;
        } catch (CertificateException ex) {
            truststore = null;
        } finally {
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException ex) {

                }
            }
        }
        return truststore;
    }

    private static KeyStore getKeyStore() {
        KeyStore keystore = null;
        java.io.FileInputStream fis = null;
        try {
            keystore = KeyStore.getInstance(System.getProperty("javax.net.ssl.trustStoreType", "JKS"));
            fis = new FileInputStream(System.getProperty("javax.net.ssl.keyStore", ""));
            keystore.load(fis, System.getProperty("javax.net.ssl.trustStorePassword", "").toCharArray());
        } catch (KeyStoreException ex) {
            keystore = null;
        } catch (FileNotFoundException ex) {
            keystore = null;
        } catch (IOException ex) {
            keystore = null;
        } catch (NoSuchAlgorithmException ex) {
            keystore = null;
        } catch (CertificateException ex) {
            keystore = null;
        } finally {
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException ex) {

                }
            }
        }
        return keystore;
    }

    private static TrustManagerFactory getTrustManagerFactory(KeyStore truststore) {
        TrustManagerFactory tmf = null;
        try {
            tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(truststore);
        } catch (NoSuchAlgorithmException ex) {
            tmf = null;
        } catch (KeyStoreException ex) {
        }
        return tmf;
    }

    private static KeyManagerFactory getKeyManagerFactory(KeyStore keystore) {
        KeyManagerFactory kmf = null;
        try {
            kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            kmf.init(keystore, System.getProperty("javax.net.ssl.trustStorePassword", "").toCharArray());
        } catch (NoSuchAlgorithmException ex) {
            kmf = null;
        } catch (KeyStoreException ex) {
            kmf = null;
        } catch (UnrecoverableKeyException ex) {
            kmf = null;
        }
        return kmf;
    }

}
