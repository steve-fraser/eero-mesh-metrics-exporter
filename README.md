Prometheus exporter for eero mesh router metrics

This application was build upon the js library: https://github.com/bbernstein/eero-js-api

Features Supported
- Client Device mbps up and down 

This application requires the `CONTACT_METHOD` to be set and then the user to hit the `/` end-point to verify the token gathered. The metrics should then be gatherable after verification, but it is recommended to set the `EERO_SESSION_COOKIE` environment variable to allow for if the pod is deleted for moved to not require re-authentication. The token is requested at the start of the container. 


| Parameter | Function |
| :----: | --- |
| `CONTACT_METHOD` | Insert account cell phone number/email (used for account authentication) |
| `EERO_SESSION_COOKIE` | Insert session code after inputing verification code on the `/` webpage to allow for easy redeploy |

If you want to run the container in bridge network mode (instead of the recommended host network mode) you will need to specify ports. The the only required port is 3000.
```
-p 3000:3000
```

| Metrics | Description |
| :----: | --- |
| `up_mbps_client` | Devices mbps up |
| `down_mbps_client` | Devices mbps up |
| `up_mbps_network` | Network mbps up from the most recent speedtest |
| `down_mbps_network` | Network mbps up from the most recent speedtest |