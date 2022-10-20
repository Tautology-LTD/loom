const tools = require("../scripts/function-library");
const webhookQueryHelper = require("../db/webhooks.js");
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

        getRawBody(req).then((data)=>{
            let order = JSON.parse(data.toString('utf8'));
            
            console.log(`Received order/create webhook for ${storeName}, order number ${order.id} updating ${storesToUpdate.join(', ')}`);
            webhookQueryHelper.findBy({order_id: order.id}).then((data)=>{
                if (!data) {
                    webhookQueryHelper.insert(order.id, 'order/create', order).then((response)=>{
                        console.log(response);
                    });

                    let storePromises = []
                    for (let i = 0; i < storesToUpdate.length; i++) {
                        storePromises.push(tools.updateStoreInventoryBySkus(storesToUpdate[i], order.line_items));
                    }
                    Promise.all(storePromises).then((response) => {
                        tools.setWebhookExecutedAtByOrderId(order.id);
                    });
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