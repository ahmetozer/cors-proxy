# Cors Proxy

This is basic Proxy server.

You can load settings from remote url.

```bash
docker run -d --rm -e configurl="https://gist.githubusercontent.com/ahmetozer/2d097b672b845115ccf67ddc36437703/raw/42a15aa0cef9b2d505be57fb229da865e6860403/testgist.json" ahmetozer/cors-proxy
```

Default config reload interval is setted to 60.  
If no request send to server, interval function is not triggered.  
You can change Config reload interval with `loadint` env variable.

```bash
docker run -d --rm  -e loadint="10" -e configurl="https://gist.githubusercontent.com/ahmetozer/2d097b672b845115ccf67ddc36437703/raw/42a15aa0cef9b2d505be57fb229da865e6860403/testgist.json" ahmetozer/cors-proxy
```

If you do not set config url, system will be allow all cross origins and request hosts.

```bash
docker run -it --rm ahmetozer/cors-proxy
```

## Json configuration

My recommend settings.

```json
{
    "origins" : [
        "ahmetozer.org",
        "apicors.ahmetozer.org"
    ],

    "hosts" : [
        "hub.docker.com"
    ]
}
```

Only control host.

```json
{
    "origins" : "",

    "hosts" : [
        "hub.docker.com"
    ]
}
```

Only control origin.

```json
{
    "origins" : [
        "ahmetozer.org",
        "apicors.ahmetozer.org"
    ],

    "hosts" : ""
}
```
