const e = require("express");
const tools = require("../scripts/function-library");
const getRawBody = require('raw-body');

module.exports = function(app){

    app.post("/:storeName/orders", (req, res) => {
        
        let storeName = req.params.storeName;
        let storesToUpdate = tools.getStores().filter(item => item !== storeName);
        console.log(`Recieved order/create notification for ${storeName}`);

        getRawBody(req).then((data)=>{
            let order = JSON.parse(data.toString('utf8'));
            let line_items = order.line_items;
            console.log(`${line_items.length} line_items in sale.`);
            let items = [];
            for(let i in line_items){
                let item = {};
                item[line_items[i].sku] = { quantity: line_items[i].fulfillable_quantity};
                items.push(item);
                
            }
            
            console.log(`Processing ${items.length} items.`);
            console.log(items);
            for(let i in storesToUpdate){
                
                console.log(`Updating ${storesToUpdate[i]} for ${Object.keys(items)}`);
                tools.updateStoreInventoryBySkus(storesToUpdate[i], items).then((response)=>{
                    console.log(response);
                });
            }   
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
        tools.postRequest(storeName, "webhooks.json", { webhook }).then((response)=>{
           res.send(response);
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        });    
        
    });
    app.get("/:storeName/webhooks/delete/:webhookId", function (req, res){
        let storeName = req.params.storeName;
        let webhookId = req. params.webhookId;

        tools.delRequest(storeName, `webhooks/${webhookId}.json`).then((response)=>{
            console.log(response);
            res.send(`Deleted Webhook ID ${webhookId}`);
       }).catch((err)=>{
            console.log(err);
            res.send(err);
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
        // tools.getRequest(req.params.storeName, "products.json", function (err, res, body) {
        //     console.log(err);
        //     let products = JSON.parse(body).products;
        //     console.log(products[0].variants[0].sku);
        //     console.log(products[0].variants[0].inventory_item_id);
            
        //     // for(let i in products){
        //     //     for(let k in products[i].variants){
                
        //     //     }
        //     // }
        // });
        console.log(`GET request for products at ${storeName}`);
        tools.getAllProducts(storeName).then((products)=>{
            console.log(`Got all the products ay lmao`);
            console.log(products);
            console.log(`Sending all products from ${storeName}`);
            res.send(products);
        });
    });
}