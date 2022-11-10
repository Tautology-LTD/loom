const applicationHelper = require("../scripts/application-helper");
const webhookQueryHelper = require("../db/webhooks");
const Queue = require('bee-queue');
const orderCreateQueue = new Queue('orderCreateQueue');

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

                    res.status(200);
                    res.send();
                } else {
                    webhookQueryHelper.insert(storeName, order.id, 'order/create', order).then((response)=>{
                        console.log(response);

                    
                        const job = orderCreateQueue.createJob({webhookId: response.id, storeName: storeName});
                        job.save();
                        job.on('succeeded', (result) => {
                            console.log(`Received result for job ${job.id}: ${result}`);
                        });

                        res.status(201);
                        res.send();

                    });
                    
                 
                   
                }

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