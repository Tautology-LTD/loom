const tools = require("../scripts/function-library");
const webhookQueryHelper = require("../db/webhooks.js");
const getRawBody = require('raw-body');

module.exports = function(app){

    app.get("/connections/all", (req, res)=>{
        let allPromises = [];
        let allStores = tools.getStores();
        for (let i in allStores) {
            allPromises.push(tools.getStoreWebhooks(allStores[i]));
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


    app.get("/connnections/:storeName", (req, res) =>{
        let storeName = req.params.storeName;

        tools.getStoreWebhooks(storeName).then((response)=>{
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
        tools.postRequest(storeName, "webhooks.json", { webhook }).then((response)=>{
            res.send(response);
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        });    
        
    });
    app.get("/connections/:storeName/:webhookId/delete", function (req, res){
        let storeName = req.params.storeName;
        let webhookId = req.params.webhookId;

        tools.delRequest(storeName, `webhooks/${webhookId}.json`).then((response)=>{
            console.log(response);
            res.send(`Deleted Webhook ID ${webhookId}`);
        }).catch((err)=>{
            console.log(err.message);
            res.send(err.message);
        })
    });

}