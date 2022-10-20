const applicationHelper = require("../scripts/application-helper");
const apiHelper = require("../scripts/api");
const webhookQueryHelper = require("../db/webhooks");
const webhookApiHelper = require("../scripts/webhook-helper");
const getRawBody = require('raw-body');

module.exports = function(app){
    app.get("/connections/all", (req, res)=>{
        let allPromises = [];
        let allStores = applicationHelper.getStores();
        for (let i in allStores) {
            allPromises.push(webhookApiHelper.getStoreWebhooks(allStores[i]));
        }
        Promise.all(allPromises).then((values)=>{
            let returnValue = [];
            for (let i in values) {
                returnValue.push({
                    store: allStores[i],
                    webhook: JSON.parse(values[i]).webhooks[0]
                });
            }
            res.render("connections.hbs", { webhooks: returnValue });
        }).catch((error)=>{
            console.log(error);
        })
    });


    app.get("/connections/:storeName", (req, res) =>{
        let storeName = req.params.storeName;

        webhookApiHelper.getStoreWebhooks(storeName).then((response)=>{
            res.send(response);
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        });
    });

    app.get("/connections/:storeName/create", (req, res) =>{
        let storeName = req.params.storeName;
        let address = `https://${req.get('host')}/${storeName}/orders`;
        let topic = "orders/create";
        let format = "json";
        
        let webhook = {
            topic,
            address,
            format
        }
        apiHelper.postRequest(storeName, "webhooks.json", { webhook }).then((response)=>{
            res.send(response);
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        });    
        
    });
    app.get("/connections/:storeName/:webhookId/delete", function (req, res){
        let storeName = req.params.storeName;
        let webhookId = req.params.webhookId;

        apiHelper.delRequest(storeName, `webhooks/${webhookId}.json`).then((response)=>{
            console.log(response);
            res.send(`Deleted Webhook ID ${webhookId}`);
        }).catch((err)=>{
            console.log(err.message);
            res.send(err.message);
        })
    });

}