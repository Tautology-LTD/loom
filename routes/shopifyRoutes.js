const tools = require("../scripts/function-library");
const getRawBody = require('raw-body');

module.exports = function(app){

    app.get("/:masterStore/sync/:storeToUpdate", (req, res)=>{
        res.send("This endpoint is under construction.");
        res.end();
        return;
        let { storeToUpdate, masterStore } = req.params;
        tools.updateStoreLevelByMaster(storeToUpdate, masterStore).then((response)=>{
            res.send(response);
        });
    });

    app.get("/:masterStore/sync", (req, res)=>{
        res.send("This endpoint is under construction.");
        res.end();
        return;
        let { masterStore } = req.params;
        let storesToUpdate = tools.getStores().filter(item => item !== masterStore);
        let allPromises = [];
        for(let i = 0; i < storesToUpdate.length; i++){
                        
            console.log(`Updating ${storesToUpdate[i]}`);
            allPromises.push( tools.updateStoreLevelByMaster(storesToUpdate[i], masterStore));
        }   
        Promise.all(allPromises).then((responses)=>{
            for(let i in responses){
                console.log(responses[i]);
            }
            console.log(`Updated ${storesToUpdate} with ${masterStore}'s levels`);

            res.send(`Updated ${storesToUpdate} with ${masterStore}'s levels`);
        })
    });

    app.post("/:storeName/orders", (req, res) => {
        
        let storeName = req.params.storeName;
        let storesToUpdate = tools.getStores().filter(item => item !== storeName);
        console.log(`Recieved order/create notification for ${storeName}`);

        getRawBody(req).then((data)=>{
            let order = JSON.parse(data.toString('utf8'));
            
            console.log("Order", order);
            tools.getOrderById(order.id).then((data)=>{
                if (!data) {
                     tools.insertOrder(order).then((response)=>{
                        console.log(response);
                     });
                    
                    let line_items = order.line_items;
                    console.log(`${line_items.length} line_items in sale.`);
                    
                    console.log(`Processing ${Object.keys(line_items).length} items.`);
                     for(let i = 0; i < storesToUpdate.length; i++){
                        tools.updateStoreInventoryBySkus(storesToUpdate[i], line_items).then((response)=>{
                            console.log(response);
                            if(i === storesToUpdate.length - 1){
                                tools.setWebhookExecutedAtByOrderId(order.id);
                            }

                        });
                    }   
                } else {
                    console.log("Order already received.");
                }

                res.status(200);
                res.send();
            })
               
           
        });
       
    });


    app.get("/:storeName/orders/create", (req, res) =>{
    
    });

    app.get("/:storeName/webhooks", (req, res) =>{
        let storeName = req.params.storeName;

        tools.getRequest(storeName, "webhooks.json").then((response)=>{
            res.send(response);
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        });
    });

    app.get("/:storeName/webhooks/create", (req, res) =>{
        let storeName = req.params.storeName;
        let address = `https://${req.get('host')}/${storeName}/orders`;
        let topic = "orders/create";
        let format = "json";
        
        let webhook = {
            topic,
            address,
            format
        }
        console.log(webhook);
        tools.postRequest(storeName, "webhooks.json", { webhook })
        .then((response)=>{
            res.send(response);
        })
        .catch((err)=>{
            console.log(err);
            res.send(err);
        });    
        
    });
    app.get("/:storeName/webhooks/delete/:webhookId", function (req, res){
        let storeName = req.params.storeName;
        let webhookId = req. params.webhookId;

        tools.delRequest(storeName, `webhooks/${webhookId}.json`)
        .then((response)=>{
            console.log(response);
            res.send(`Deleted Webhook ID ${webhookId}`);
        })
        .catch((err)=>{
            console.log(err.message);
            res.send(err.message);
        })
    });

    app.get("/:storeName/products/update/:sku/:quantity", (req, res) => {
        let storeName = req.params.storeName;
        let productSKU = req.params.sku;
        let quantityAdjustment = -parseInt(req.params.quantity);

        let storesToUpdate = tools.getStores().filter(item => item !== storeName);
        let items = [];
             let item = {};
            item[productSKU] = { quantity:quantityAdjustment};
            items.push(item);
            
        
        
        console.log(`Processing ${items.length} items.`);

        for(let i in storesToUpdate){
            
            console.log(`Updating ${storesToUpdate[i]} for ${Object.keys(items)}`);
            tools.updateStoreInventoryBySkus(storesToUpdate[i], items);
        }   
    
    });

    app.get("/:storeName/products", (req, res) =>   {
        let storeName = req.params.storeName;
         
        console.log(`GET request for products at ${storeName}`);
        tools.getAllProducts(storeName).then((products)=>{
            console.log(`Got all the products ay lmao`);
            console.log(products);
            console.log(`Sending all products from ${storeName}`);
            res.send(products);
        });
    });
}