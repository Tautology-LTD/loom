const crypto = require('crypto');
const nonce = require('nonce')();
const querystring = require('querystring');

const cookie = require('cookie');
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();

const applicationHelper = require("../scripts/application-helper")
const webhookQueryHelper = require("../db/webhooks")
const helpers = require("../scripts/hbs-helpers");
const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));
app.engine('hbs', exphbs.engine({
    partialsDir: "./views/partials",
    layoutsDir: "./views/layouts",
    defaultLayout: 'default',
    extname: '.hbs',
    helpers: helpers
}));

require("../routes/db")(app);
require("../routes/connection")(app);
require("../routes/shopify")(app);
require("../routes/sync")(app);
app.use(express.static(path.resolve('./public')));

app.get("/addToQueue/:storeName/:webhookId", (req, res)=>{
    let webhookId = req.params.webhookId;
    let storeName = req.params.storeName;
    
    const Queue = require('bee-queue');
    const queue = new Queue('webhooksQueue');

    const job = queue.createJob({webhookId, storeName});
    job.save();
    job.on('succeeded', (result) => {
        console.log(`Received result for job ${job.id}: ${result}`);
    });
 
});

app.get("/", (req, res) => {
    let allPromises = [];
    allPromises.push(webhookQueryHelper.limit(5));
    allPromises.push(applicationHelper.getStores());

    
    Promise.all(allPromises).then((values)=>{
        let data = {};
        data.webhooks = values[0];
        data.storeLinks = values[1];
        console.log(data);
        res.render("home.hbs", data);
    }).catch((errors)=>{
        console.log(errors);
    });
});

app.listen(process.env.PORT, () => console.log(`Application listening on port ${process.env.PORT}!`));