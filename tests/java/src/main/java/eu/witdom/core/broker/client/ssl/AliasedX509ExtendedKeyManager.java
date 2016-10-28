package eu.witdom.core.broker.client.ssl;

import java.net.Socket;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;

import javax.net.ssl.SSLEngine;
import javax.net.ssl.X509ExtendedKeyManager;
import javax.net.ssl.X509KeyManager;


/* ------------------------------------------------------------ */
/**
 * KeyManager to select a key with desired alias
 * while delegating processing to specified KeyManager
 * Can be used both with server and client sockets
 */
public class AliasedX509ExtendedKeyManager extends X509ExtendedKeyManager
{
    private String _keyAlias;
    private X509KeyManager _keyManager;

    /* ------------------------------------------------------------ */
    /**
     * Construct KeyManager instance
     * @param keyAlias Alias of the key to be selected
     * @param keyManager Instance of KeyManager to be wrapped
     * @throws Exception
     */
    public AliasedX509ExtendedKeyManager(String keyAlias, X509KeyManager keyManager)
    {
        _keyAlias = keyAlias;
        _keyManager = keyManager;
    }

    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509KeyManager#chooseClientAlias(java.lang.String[], java.security.Principal[], java.net.Socket)
     */
    public String chooseClientAlias(String[] keyType, Principal[] issuers, Socket socket)
    {
        return _keyAlias == null ? _keyManager.chooseClientAlias(keyType, issuers, socket) : _keyAlias;
    }

    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509KeyManager#chooseServerAlias(java.lang.String, java.security.Principal[], java.net.Socket)
     */
    public String chooseServerAlias(String keyType, Principal[] issuers, Socket socket)
    {
        return _keyAlias == null ? _keyManager.chooseServerAlias(keyType, issuers, socket) : _keyAlias;
    }

    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509KeyManager#getClientAliases(java.lang.String, java.security.Principal[])
     */
    public String[] getClientAliases(String keyType, Principal[] issuers)
    {
        return _keyManager.getClientAliases(keyType, issuers);
    }


    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509KeyManager#getServerAliases(java.lang.String, java.security.Principal[])
     */
    public String[] getServerAliases(String keyType, Principal[] issuers)
    {
        return _keyManager.getServerAliases(keyType, issuers);
    }

    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509KeyManager#getCertificateChain(java.lang.String)
     */
    public X509Certificate[] getCertificateChain(String alias)
    {
        return _keyManager.getCertificateChain(alias);
    }

    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509KeyManager#getPrivateKey(java.lang.String)
     */
    public PrivateKey getPrivateKey(String alias)
    {
        return _keyManager.getPrivateKey(alias);
    }

    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509ExtendedKeyManager#chooseEngineServerAlias(java.lang.String, java.security.Principal[], javax.net.ssl.SSLEngine)
     */
    @Override
    public String chooseEngineServerAlias(String keyType, Principal[] issuers, SSLEngine engine)
    {
        return _keyAlias == null ? super.chooseEngineServerAlias(keyType,issuers,engine) : _keyAlias;
    }


    /* ------------------------------------------------------------ */
    /**
     * @see javax.net.ssl.X509ExtendedKeyManager#chooseEngineClientAlias(String[], Principal[], SSLEngine)
     */
    @Override
    public String chooseEngineClientAlias(String keyType[], Principal[] issuers, SSLEngine engine)
    {
        return _keyAlias == null ? super.chooseEngineClientAlias(keyType,issuers,engine) : _keyAlias;
    }
}
