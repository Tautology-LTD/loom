console.log(__filename);
require('dotenv').config();

const applicationHelper = require("../scripts/application-helper");
const webhookQueryHelper = require("../db/webhooks");
const inventoryHelper = require("../scripts/inventory-helper");



const Queue = require('bee-queue');

const orderCreateQueue = new Queue('orderCreateQueue');

// Process jobs from as many servers or processes as you like
orderCreateQueue.process(function (job, done) {
    console.log(`Processing job id: ${job.id} webhook id: ${job.data.webhookId}`);
     
    webhookQueryHelper.findBy({id: job.data.webhookId}).then((data)=>{
        if(data){
            let order = data.payload;
            if(data.executed_at){
                console.log("Webhook already executed.");
                return done(null, job.data.webhookId);
            }else{
                
                let storesToUpdate = applicationHelper.getStores().filter(item => item !== data.store_name);
                let storePromises = [];

                for (let i = 0; i < storesToUpdate.length; i++) {
                    storePromises.push(inventoryHelper.decreaseStoreInventoryBySkus(storesToUpdate[i], order.line_items));
                }
                Promise.all(storePromises).then((responses) => {
                    let updateObject = {executed_at: "CURRENT_TIMESTAMP"};
                    webhookQueryHelper.update(updateObject, {id: job.data.webhookId});
                    return done(null, job.data.webhookId);

                    
                });
            }
        }
    });
   
});
