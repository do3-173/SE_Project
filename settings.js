/**
 * Node-RED settings for Railway deployment
 */

module.exports = {
    // The TCP port that the Node-RED web server is listening on
    uiPort: process.env.NODE_RED_PORT || 1880,

    // The maximum length, in characters, of any message sent to the debug sidebar tab
    debugMaxLength: 1000,

    // The file containing the flows. If not set, it defaults to flows_<hostname>.json
    flowFile: '/data/flows.json',

    // To enabled pretty-printing of the flow within the flow file, set the following
    // property to true:
    flowFilePretty: true,

    // By default, credentials are encrypted in storage using a generated key. To
    // specify your own secret, set the following property.
    // If you want to disable encryption of credentials, set this property to false.
    // Note: once you set this property, do not change it - doing so will prevent
    // node-red from being able to decrypt your existing credentials and they will be
    // lost.
    credentialSecret: process.env.NODE_RED_CREDENTIAL_SECRET || "a-secret-key-for-railway",

    // By default, all user data is stored in the Node-RED install directory. To
    // use a different location, the following property can be used
    userDir: '/data/',

    // Node-RED scans the `nodes` directory in the install directory to find nodes.
    // The following property can be used to specify an additional directory to scan.
    nodesDir: '/data/nodes',

    // By default, the Node-RED UI accepts connections on all IPv4 interfaces.
    // The following property can be used to listen on a specific interface. For
    // example, the following would only allow connections from the local machine.
    uiHost: "0.0.0.0",

    // Retry time in milliseconds for MQTT connections
    mqttReconnectTime: 15000,

    // Retry time in milliseconds for Serial port connections
    serialReconnectTime: 15000,

    // Retry time in milliseconds for TCP socket connections
    socketReconnectTime: 10000,

    // Timeout in milliseconds for TCP server socket connections
    // defaults to no timeout
    socketTimeout: 120000,

    // The maximum length, in characters, of any message sent to the debug sidebar tab
    debugMaxLength: 1000,

    // To disable the option for using local files for storing keys and certificates in the TLS configuration
    // node, set this to true
    tlsConfigDisableLocalFiles: false,

    // Colourise the console output of the debug node
    debugUseColors: true,

    // The file containing the flows. If not set, it defaults to flows_<hostname>.json
    flowFile: 'flows.json',

    // Context Storage
    contextStorage: {
        default: {
            module: "memory"
        }
    },

    // Configure the logging output
    logging: {
        // Only console logging
        console: {
            level: "info",
            metrics: false,
            audit: false
        }
    },

    // Set to false to disable the editor. The admin API is not affected by this option.
    httpAdminRoot: '/admin',

    // Set to false to disable the runtime API. The editor and admin API are not affected by this option.
    httpNodeRoot: '/api',

    // Remove the middleware since HTTP server handles health checks now
    // The following property can be used to add a custom middleware function
    // in front of the HTTP In node.
    httpNodeMiddleware: function(req,res,next) {
        // Handle CORS
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    },

    // Remove static file serving from Node-RED - handled by main HTTP server
    // httpStatic: '/app',

    // Remove health check from Node-RED - handled by main HTTP server
    // httpStaticAuth: function(req, res, next) {
    //     if (req.url === '/health') {
    //         res.setHeader('Content-Type', 'application/json');
    //         res.status(200);
    //         const healthData = {
    //             'status': 'healthy',
    //             'services': {
    //                 'node_red': `running on port ${process.env.PORT || '1880'}`,
    //                 'mqtt': `running on port ${process.env.MQTT_PORT || '1883'}`,
    //                 'http_server': `running on port ${process.env.HTTP_PORT || '8000'}`
    //             },
    //             'timestamp': new Date().toISOString()
    //         };
    //         res.end(JSON.stringify(healthData));
    //         return;
    //     }
    //     next();
    // },

    // The maximum size of HTTP request that will be accepted by the runtime api.
    // Default: 5mb
    apiMaxLength: '5mb',

    // If you installed the optional node-red-dashboard you can set it's path
    // relative to httpRoot
    ui: { path: "ui" },

    // Securing Node-RED
    // -----------------
    // Password protection disabled for easier access
    // adminAuth: {
    //     type: "credentials",
    //     users: [{
    //         username: process.env.NODE_RED_USERNAME || "admin",
    //         password: process.env.NODE_RED_PASSWORD_HASH || "$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.", // default: "password"
    //         permissions: "*"
    //     }]
    // },

    // Functions can be in an external file which exports a function.
    // functionExternalModules: true,

    // The following property can be used to enable HTTPS
    // See http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
    // for details on its contents.
    // This property can be either an object, or a string that represents a filename to load.
    //https: {
    //    key: fs.readFileSync('privatekey.pem'),
    //    cert: fs.readFileSync('certificate.pem')
    //},

    // The following property can be used to disable the loading of specific nodes
    disableEditor: false,
}
