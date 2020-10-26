
const fs = require('fs');

var eeroAPI = require("eero-js-api")

var COOKIE_FILE = "/tmp/cookiefilestore2298723872398423487623"

var networkURL = null;

var prometheus = null;

//TODO:: var upMBPSSpeedTestMetric = null;
//TODO:: var downMBPSSpeedTestMetric = null;

var upMBPSClientMetric = null;
var downMBPSClientMetric = null;

var e;


exports.loginVerify = function (code) {
    return new Promise(function (resolve, reject) {
        if (networkURL == null) {
            e.loginVerify(code)
                .then(() => {
                    console.log("Logged in");
                    const data = fs.readFileSync(COOKIE_FILE, 'utf8')
                    resolve(data);
                })
                .catch(err => {
                    reject(Error(err.message));
                });
        }
    });

}

exports.getAccount = function (contactMethod, cookie) {

    if (cookie != null) {
        // success case, the file was saved
        console.log('Cookie inserted into file');
        fs.writeFile(COOKIE_FILE, cookie, (err) => {
            // throws an error, you could also catch it here
            e = new eeroAPI();
            if (err) 
                throw err;
            e.account().then(account => {
                console.log("logged into account")
                console.log(account);
                if (account.networks.data.length == 1) {
                    // only one account, use it
                    networkURL = account.networks.data[0].url
                }
            }).catch(err => {
                console.log(`error ${err.message}`);
                e.login(contactMethod);
            });
        });

    }
    else {
        e = new eeroAPI();
        e.account().then(account => {
            console.log("logged into account")
            console.log(account);
            if (account.networks.data.length == 1) {
                // only one account, use it
                networkURL = account.networks.data[0].url;
            }
        }).catch(err => {
            console.log(`error ${err.message}`);
            e.login(contactMethod);
        });
    };

};



exports.run = function (prom) {
    prometheus = prom;
    upMBPSClientMetric = new prometheus.Gauge({
        name: 'up_mbps_client',
        help: 'mbps up',
        labelNames: ["hostname", "nickname", "ip","connection_type"]
    });

    downMBPSClientMetric = new prometheus.Gauge({
        name: 'down_mbps_client',
        help: 'mbps down',
        labelNames: ["hostname", "nickname", "ip", "connection_type"]
    });
    upMBPSNetworkMetric = new prometheus.Gauge({
        name: 'up_mbps_network',
        help: 'mbps up',
        labelNames: ["name"]
    });

    downMBPSNetworkMetric = new prometheus.Gauge({
        name: 'down_mbps_network',
        help: 'mbps down',
        labelNames: ["name"]
    });
    setTimeout(getMetrics, 5 * 1000);
}
function getMetrics() {
    if (networkURL != null) {
        e.devices(networkURL)
            .then(devices => {
                for (const dev of devices) {
                    if (dev.usage != null) {
                        hostname = dev.hostname;
                        nickname = dev.nickname;
                        ip = dev.ip;
                        connection_type = dev.connection_type;


                        down_mbps = dev.usage.down_mbps;
                        up_mbps = dev.usage.up_mbps;


                        console.log(hostname + ": " + up_mbps);
                        upMBPSClientMetric.set({ hostname: hostname, nickname: nickname, ip: ip, connection_type: connection_type}, up_mbps);

                        console.log(hostname + ": " + down_mbps);
                        downMBPSClientMetric.set({ hostname: hostname, nickname: nickname, ip: ip, connection_type: connection_type }, down_mbps);
    
                    }
                }
            })
            .catch(err => {
                console.log(`Error: ${err.message}`)
            })
        e.network(networkURL)
            .then(nets => {

                name = nets.name;


                down_mbps = nets.speed.up.value;
                up_mbps = nets.speed.down.value;

                console.log(name + ": " + up_mbps);
                upMBPSNetworkMetric.set({ name: name }, up_mbps);

                console.log(name + ": " + down_mbps);
                downMBPSNetworkMetric.set({ name: name }, down_mbps);

            })
            .catch(err => {
                println(`Error: ${err.message}`);
            })
    }
    setTimeout(getMetrics, 5 * 1000);
}



