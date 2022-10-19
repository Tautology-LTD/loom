const request = require('request-promise');
const { func } = require('../db/db');
const insertWebhookData = require("../db/queries/webhooks/insert-webhook-data.js");
const createWebhooksTable = require("../db/queries/webhooks/create-webhooks-table.js");
const updateWebhookData = require("../db/queries/webhooks/update-webhook-data.js");
const getWebhookData = require("../db/queries/webhooks/get-webhook-data.js");
const getAllWebhookData = require("../db/queries/webhooks/get-all-webhook-data.js");
const getLastFiveWebhooks = require("../db/queries/webhooks/get-last-five-webhooks.js");
const getLastHundredWebhooks = require('../db/queries/webhooks/get-last-hundred-webhooks');

const db = require("../db/db");
console.log(db);

module.exports = {
    // Takes an array of items, and returns an object where the keys are the sku and the value is as on line 23 and 24
    assembleItems: function (inputItems, quantityField) {
        let outputItems = {};
        for(let i = 0; i < inputItems.length; i++){
           if(inputItems[i].variants){ // if the item variants, create an outputItem for each
                let variants = inputItems[i].variants;
                for(let k = 0; k < variants.length; k++){
                    if(variants[k].sku != null){
                        outputItems[variants[k].sku] = {
                            quantity: variants[k][quantityField],
                            sku:  variants[k].sku
                        };
                    }
                }
            }else{ // otherwise create an outputItem from the item itself
                if(inputItems[i].sku != null){
                    outputItems[inputItems[i].sku] = {
                        quantity: inputItems[i][quantityField],
                        sku: inputItems[i].sku
                    };
                }
            }
        }
        return outputItems;
    },
    //library functions for specific tasks
    getStoreURL: function (store){
        switch(store){
            case "bailey":
                return process.env.BAILEY_HOST;
                break;
            case "dstld":
                return process.env.DSTLD_HOST
                break;
            case "stateside":
                return process.env.STATESIDE_HOST;
                break;
        }
    },

    getShopifyToken: function (store){
        switch(store){
            case "bailey":
                return process.env.BAILEY_SHOPIFY_TOKEN;
                break;
            case "dstld":
                return process.env.DSTLD_SHOPIFY_TOKEN;
                break;
            case "stateside":
                return process.env.STATESIDE_SHOPIFY_TOKEN;
                break;
        }
    },

    getStores: function (){
        return ["bailey", "dstld", "stateside"];
    },
    getStoreWebhooks: function (store) {
        return module.exports.getRequest(store, "webhooks.json");
    },
    getStoreLocationId: function (store){
    
        switch(store){
            case "bailey":
                return process.env.BAILEY_LOCATION_ID;
                break;
            case "dstld":
                return process.env.DSTLD_LOCATION_ID;
                break;
            case "stateside":
                return process.env.STATESIDE_LOCATION_ID;
                break;
            default:
                return 0;
                break;
        }
    },

    apiRequest: function (store, method, resource, body){
        return new Promise((resolve, reject)=>{
           
            let TOKEN = module.exports.getShopifyToken(store);
            if(TOKEN){
                let requestObject = {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': TOKEN
                    },
                    method: method,
                    uri: `https://${module.exports.getStoreURL(store)}/admin/api/${ process.env.API_VERSION}/${resource}`,

                }
                console.log(`${requestObject.method} ${requestObject.uri}`);   

                if(body){
                    requestObject.body = JSON.stringify(body);
                }
                request(requestObject).then(resolve).catch(reject);
            }else{
                reject(`No token found for ${store}`);
            }
        });
    },

    getRequest: function (store, resource, callback){
         return module.exports.apiRequest(store, "GET", resource);
    },

    postRequest: function (store, resource, body, callback){
         return module.exports.apiRequest(store, "POST", resource, body);

    },

    delRequest: function (store, resource, callback){
         return module.exports.apiRequest(store, "DELETE", resource);
    },

    updateStoreLevelByMaster: function (storeToUpdate, masterStore){
        return new Promise((resolve, reject)=>{
            console.log(`Syncing ${storeToUpdate}'s levels to the leveld of ${masterStore}`);
            let store_location_id = module.exports.getStoreLocationId(storeToUpdate);

            if (!store_location_id) {         
                console.log(`No Location Id found for store: ${store}`);
                resolve(`No Location Id found for store: ${store}`);                  
            } else {
            
                module.exports.getAllProducts(masterStore).then((masterStoreProducts)=>{
    
                    if (!masterStoreProducts.length) {
                        console.log(`No products at ${masterStoreProducts}`);
                        resolve(`No products at ${masterStoreProducts}`);
                    } else {

                        let masterItems = module.exports.assembleItems(masterStoreProducts, `inventory_quantity`);
                        let masterSKUs = Object.keys(masterItems);

                        module.exports.getAllProducts(storeToUpdate).then((storeToUpdateProducts)=>{
                            
                            console.log(`Got ${storeToUpdateProducts.length} products from ${storeToUpdate}`);
                            if (!storeToUpdateProducts.length) {
                                console.log(`No products at ${storeToUpdate}`);
                                resolve(`No products at ${storeToUpdate}`);
                            } else {
                                let allPromises = [];

                                let variants = {};
                                for (let product of storeToUpdateProducts) {
                                        for (let variant of product.variants) {
                                            variants[variant.id] = variant;
                                        }
                                }
                             
                                variants = Object.values(variants); // de-duplicate the variants
                                console.log(`Now we have ${storeToUpdateProducts.length} products, ${variants.length} variants from ${storeToUpdate}`);

                                for (let variant of variants) {

                                    if (masterSKUs.includes(variant.sku) && masterItems[variant.sku].inventory_quantity !== variant.quantity) {
                                     // if(typeof variants[k].sku != null && masterSkus.includes(variants[k].sku) && variants[k].sku.includes("TEST_SKU")
                                     // &&  masterItems[variants[k].sku].quantity != variants[k].inventory_quantity ){
                                          
                                            let body = {
                                                location_id: store_location_id,
                                                inventory_item_id: variant.inventory_item_id,
                                                available: masterItems[variant.sku].inventory_quantity
                                            };
                                            console.log(`Setting Inventory for Store: ${storeToUpdate}, SKU: ${variant.sku}, Variant ID: ${variant.id}, InventoryItem ID: ${body.inventory_item_id}, by quantity: ${body.available}`);
                                            allPromises.push(module.exports.postRequest(storeToUpdate, "inventory_levels/set.json", body));
                                               
                                        }
                                }
                                Promise.all(allPromises).then((values)=>{
                                        values.forEach((item)=>{
                                            console.log(`Set ${item}.`);
                                        })
                                        resolve(`Set ${values.length} products at ${storeToUpdate}`);
                                }).catch((error)=>{
                                        console.log(error.error);
                                        reject(error);
                                });
                            }
                             
                        });

                    }
                });
            }
        
        });

    },

    updateStoreInventoryBySkus: function (store, line_items){
        return new Promise((resolve, reject)=>{
            let items = module.exports.assembleItems(line_items, `fulfillable_quantity`);
            let skus = Object.keys(items);
            console.log(`Update Store Inventory By SKUS, Store: ${store}, Total Items: ${Object.keys(items).length}, SKUs: ${skus.join(', ')}`)
            let store_location_id = module.exports.getStoreLocationId(store);
                        
            if (!skus.length) {
                console.log(`No matching items found for store ${store}.`);
                resolve(`No matching items found for store ${store}.`);
            } else if (!store_location_id) {
                console.log(`No Location Id found for store: ${store}`);
                resolve(`No Location Id found for store: ${store}`);
            } else {
                module.exports.getAllProducts(store).then((products) => {
                    if (!products) {
                        console.log(`No products at ${store}`);
                        resolve(`No products at ${store}`);
                    } else {
                        let allPromises = [];
                        let variants = {};
                        for (let product of products) {
                            for (let variant of product.variants) {
                                variants[variant.id] = variant;
                            }
                        }
                        console.log(`Got ${products.length} products, ${Object.keys(variants).length} variants from ${store}`);
                        console.log(`De-duplicating the variants from ${store}`);
                        variants = Object.values(variants); // de-duplicate the variants
                        console.log(`Now we have ${products.length} products, ${variants.length} variants from ${store}`);
                         for (let variant of variants) {
                             if (skus.includes(variant.sku)) {
                                let body = {
                                    location_id: store_location_id,
                                    inventory_item_id: variant.inventory_item_id,
                                    available_adjustment: -items[variant.sku].quantity
                                };
                                console.log(`Adjusting Inventory for Store: ${store}, SKU: ${variant.sku}, Variant ID: ${variant.id}, InventoryItem ID: ${body.inventory_item_id}, by quantity: ${body.available_adjustment}`);
                                allPromises.push(module.exports.postRequest(store, "inventory_levels/adjust.json", body));
                            }
                        }
                        Promise.all(allPromises).then((values)=>{
  
                            console.log(`Finished adjusting ${ values.length } products for ${store}.`);
                            resolve(`Finished adjusting  ${ values.length } products for ${store}.`);

                        }).catch((errors)=>{
                            console.log(errors);
                            reject(errors);
                        })
                    }
                });
            }
        });
    },
   
    getAllProducts: function (store, products = []) {
       return new Promise((resolve, reject)=>{
            let limit = 250;
            let link = `products.json?limit=${limit}`;
            if (products.length) {
                link = `${link}&since_id=${products[products.length-1].id}`
            }

            module.exports.getRequest(store, link).then((res) => {
                let newProducts = JSON.parse(res).products;
                products = [...products, ...newProducts];
                if (newProducts.length == limit) {
                    module.exports.getAllProducts(store, products).then(resolve);
                } else {
                    console.log(`Resolving getAllProducts for ${store} with ${products.length} total products`);
                    resolve(products);
                }
            });
       });
    },

    getDashboardData: function(){
        return new Promise((resolve, reject)=>{
            let allPromises = [];
            allPromises.push(module.exports.getFiveRecentWebhooks());
            allPromises.push(module.exports.getStores());

            Promise.all(allPromises).then((values)=>{
                let data = {};
                data.webhooks = values[0];
                data.storeLinks = values[1];
                console.log(data);
                resolve(data);
            }).catch((errors)=>{
                console.log(errors);
                reject(errors);
            })
        });
    },
     
    getOrderById: function(orderID) {
        console.log(getWebhookData);
        return db.oneOrNone(getWebhookData, [orderID]);
      
    },
    getWebhooksData: function(){
        console.log(getAllWebhookData);
        return db.manyOrNone(getAllWebhookData);
    },

    setWebhookExecutedAtByOrderId: function(orderId){
        console.log(updateWebhookData);
        return db.none(updateWebhookData, [Date.now(), orderId]);    

   },
   insertOrder: function(orderData){
        console.log(insertWebhookData);
        return db.none(insertWebhookData, [orderData.id, `order/create`, Date.now(), orderData]);    
   },
  
   createWebhookTable: function(){
        console.log(createWebhooksTable);
        return db.none(createWebhooksTable);
       
   },
   getFiveRecentWebhooks: function(){
    console.log(getLastFiveWebhooks);
        return db.manyOrNone(getLastFiveWebhooks);
          
   },
   getHundredRecentWebhooks: function(){
    console.log(getLastHundredWebhooks);
        return db.manyOrNone(getLastHundredWebhooks);
   }
     
    // updateStoreSkuInventory: function (store, sku, adjustment){
    //     console.log(sku);`
    //     module.exports.getInventoryItemIdBySku(store, sku, function(invetoryItemId){
    //         console.log(invetoryItemId);
            
    //     });

    // },

    // paginateProducts: function (store, link, sku, callback){
    //     console.log("Paginating products.");
    //     console.log(link);
    //     if(!link){
    //         link = "products.json?limit=250&since_id=0"
    //     }        

    //     module.exports.getRequest(store, link, function(res){
            
    //         console.log("RES:");    
    //         // let headers = res.getHeaders();

    //         let data = JSON.parse(res);
            
    //         // let nextPageInfo = headers.link.split(",");
    //         // for(let i in nextPageInfo){
    //         //     if(nextPageInfo[i].includes("next")){
    //         //         nextPageLink = nextPageInfo[i].split(">;")[0].split(`${process.env.API_VERSION}/`)[1];
    //         //     }
    //         // }
    //         let products = data.products; //paginate products
    //         let nextPageLink = "";
    //         if(products.length){
    //             nextPageLink = `products.json?limit=250&since_id=${products[products.length-1].id}`;
    //         }

    //         console.log(products.length);
    //         console.log(store);
    //         console.log(nextPageLink);
    //         let invetoryItemId;
    //         for(let i in products){
    //             let variants = products[i].variants;
    //             for(let k in variants){
    //                 if(variants[k].sku === sku){
    //                     invetoryItemId = variants[k].inventory_item_id;
    //                 }
    //             }
    //         }
    //         if(invetoryItemId){
    //             console.log(`No Inventory Item Id found for ${sku} in ${store}`);
    //             console.log(invetoryItemId);
    //             callback(invetoryItemId);

    //         }else{
    //             if(nextPageLink){
    //                 console.log("Calling next link.");
    //                 module.exports.paginateProducts(store, nextPageLink, sku, callback);
    //             }else{
    //                 console.log(`No Inventory Item Id found for ${sku} in ${store}`);

    //             }
    //         }
    //     });

    // },
   

    // getInventoryItemIdBySku: function (store, sku, callback){
    //     console.log("getting Inventory Item Id");
    //     module.exports.paginateProducts(store, "products.json?limit=250", sku, callback);
    // }

}
