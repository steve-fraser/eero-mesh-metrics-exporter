'use strict';

const express = require('express');
var path = require('path');
var gatherMetrics = require('./gather_metrics.js');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

var CONTACT_METHOD = process.env.CONTACT_METHOD || null;
var EERO_SESSION_COOKIE = process.env.EERO_SESSION_COOKIE || null;

console.log("EERO_SESSION_COOKIE: " + EERO_SESSION_COOKIE);
console.log("CONTACT_METHOD: " + CONTACT_METHOD);
var prometheus = require('prom-client');

gatherMetrics.getAccount(CONTACT_METHOD, EERO_SESSION_COOKIE);


gatherMetrics.run(prometheus);

// App
const app = express();

app.use(express.urlencoded({
    extended: true
}))
app.engine('html', require('ejs').renderFile);


app.get('/metrics', (req, res) => {
    res.set('Content-Type', prometheus.register.contentType)
    res.end(prometheus.register.metrics())
})


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
      
});

app.post('/submit-validation-token', function (req, res) {
    var validationCode = req.body.varificationCode;
    //    gatherMetrics.validateToken(validationCode);
    gatherMetrics.loginVerify(validationCode).then(function (cookie) {
        res.render(__dirname + "/successful_login.html", { cookie: cookie });
        gatherMetrics.getAccount(CONTACT_METHOD, cookie);

    });
})


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);