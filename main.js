const fs = require('fs');

const https = require('https');

const httpsOptions = {
    key: fs.readFileSync('/etc/ssl/private/cors_proxy.key'),
    cert: fs.readFileSync('/etc/ssl/certs/cors_proxy.crt')
  };

var cors_proxy_config = {
  "origins" : [
      "localhost"
  ],

  "hosts" : [
      "localhost"
  ]
}

var  configLastUpdate = 0


https.createServer(httpsOptions, onRequest).listen(443);

const loadint = (RegExp('^\\d+$').test(process.env.loadint)) ? process.env.loadint : 60

if (RegExp('^\\d+$').test(process.env.loadint)){
  console.log("\tSetting cache interval:" +loadint)
} else {
  console.log("\tenv loadint empty. \n\tSetting cache interval " +loadint+ " by default")
} 




function extractHostname(url) {
    url = url.substring(1)
    let hostname;
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}



// Remove scheme and hosts from url

function newUrl(url,host) {
    return url.substring(url.indexOf(host) + host.length)
}

// Control Origin and Host

function originAndHostControl(origin,host) {

    if ( (origin != null || ( cors_proxy_config.origins == null || cors_proxy_config.origins == "" ) )&& ( host != null || host != "")) {
        if ( (cors_proxy_config.origins != null && cors_proxy_config.origins != "" ) && (cors_proxy_config.hosts != null && cors_proxy_config.hosts != "" ) ) {
          //if control host and origins
          origin = extractHostname(origin)
          return cors_proxy_config.origins.includes(origin) && cors_proxy_config.hosts.includes(host)


        } else if ( (cors_proxy_config.origins == null || cors_proxy_config.origins == "" ) && (cors_proxy_config.hosts != null && cors_proxy_config.hosts != "" ) ) {
           // If only control hosts
          return cors_proxy_config.hosts.includes(host)


        } else if ( (cors_proxy_config.origins != null && cors_proxy_config.origins != "" ) && (cors_proxy_config.hosts == null || cors_proxy_config.hosts == "" ) ) {
          // If only control origins
          return cors_proxy_config.origins.includes(origin)


        } else {
          // If origin and host variable is not set in config
          return true
        }
      } else {
        return false
    }


}


// Load configuration from config url
  if ( process.env.configurl != undefined && process.env.configurl != "" ) {
    function loadConfig() {
    const now = new Date()  
    const secondsSinceEpoch = Math.round(now.getTime() / 1000)  

    if ( secondsSinceEpoch - configLastUpdate < loadint*1 ) {
      return
    } 
    //console.log("Loading Config " + process.env.configurl)
   
    let req = https.get(process.env.configurl, function(res) {
      let data = '';
    
      res.on('data', function(stream) {
        data += stream;
      });
      res.on('end', function() {
    
        try {
          JSON.parse(data);
        } catch (e) {
        console.log("Setting Parse Error")
        return
        }
    
        configLastUpdate = secondsSinceEpoch
        cors_proxy_config = JSON.parse(data);
        //console.log(cors_proxy_config);
      });
    });
    
    req.on('error', function(e) {
        console.log(e.message);
    });

    }
  } else {
    console.log("\tenv configurl is not defined.\n\tAll origin and hosts are allowed")
    cors_proxy_config = {origins: null, hosts: null}
    function loadConfig() {}
}

loadConfig()



function onRequest(client_req, client_res) {
  //console.log('serve: ' + client_req.url);
  
  
  const requestOrigin =  client_req.headers.origin
  client_req.headers.host= extractHostname(client_req.url)
  client_req.url = newUrl(client_req.url,  client_req.headers.host)

  //console.log('HOST: ' + client_req.headers.host);

  if (originAndHostControl(client_req.headers.origin,client_req.headers.host)) {
  var options = {
    hostname: client_req.headers.host,
    port: 443,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers
  };
  var proxy = https.request(options, function (res) {
    if (client_req.headers.origin != undefined) {
      res.headers["Access-Control-Allow-Origin"] = requestOrigin
    }
    client_res.writeHead(res.statusCode, res.headers)
    res.pipe(client_res, {
      end: true
    });
  });

  proxy.on('error', function(err) {
    client_res.writeHead(520);
    client_res.end(err.toString());
  });

  client_req.pipe(proxy, {
    end: true
  });


} else {
    client_res.writeHead(403);
    client_res.end("not allowed");
}

loadConfig()
}