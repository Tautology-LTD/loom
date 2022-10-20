const applicationHelper = require("../scripts/application-helper");
const inventoryHelper = require("../scripts/inventory-helper")
const webhookQueryHelper = require("../db/webhooks");

const getRawBody = require('raw-body');

module.exports = function(app){

    app.post("/:storeName/orders", (req, res) => {       
        let storeName = req.params.storeName;
        let storesToUpdate = applicationHelper.getStores().filter(item => item !== storeName);

        getRawBody(req).then((data)=>{
            let order = JSON.parse(data.toString('utf8'));
            
            console.log(`Received order/create webhook for ${storeName}, order number ${order.id} updating ${storesToUpdate.join(', ')}`);
            webhookQueryHelper.findBy({order_id: order.id}).then((data)=>{
                if (data) {
                    console.log("Order already received.");
                } else {
                    webhookQueryHelper.insert(order.id, 'order/create', order).then((response)=>{
                        console.log(response);
                    });

                    let storePromises = []
                    for (let i = 0; i < storesToUpdate.length; i++) {
                        storePromises.push(inventoryHelper.updateStoreInventoryBySkus(storesToUpdate[i], order.line_items));
                    }
                    Promise.all(storePromises).then((response) => {
                        webhookQueryHelper.update({executed_at: Date.now()}, {order_id: order.id});
                    });
                }

                res.status(200);
                res.send();
            })
        });
    });

    app.get("/:storeName/products", (req, res) =>   {
        let storeName = req.params.storeName;
         
        console.log(`GET request for products at ${storeName}`);
        productHelper.getAllProducts(storeName).then((products)=>{
            console.log(products);
            console.log(`Sending all products from ${storeName}`);
            res.send(products);
        });
    });

}