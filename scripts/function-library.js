const request = require('request-promise');
const { func } = require('../db/db');
const insertWebhookData = require("../migrations/helpers/insert-webhook-data.js");
const createWebhooksTable = require("../migrations/helpers/create-webhooks-table.js");
const updateWebhookData = require("../migrations/helpers/update-webhook-data.js");
const getWebhookData = require("../migrations/helpers/get-webhook-data.js");
const getAllWebhookData = require("../migrations/helpers/get-all-webhook-data.js");

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

          if(store_location_id){
            module.exports.getAllProducts(masterStore).then((masterStoreProducts)=>{
 
               if(masterStoreProducts){
                let masterItems = module.exports.assembleItems(masterStoreProducts, `inventory_quantity`);
 
                let adjustedProductsCount = 0;
            //    let masterSkus = Object.keys(masterItems);
                let doneProducts = [];
                let allPromises = [];

                module.exports.getAllProducts(storeToUpdate).then((storeToUpdateProducts)=>{
                     if(storeToUpdateProducts){
                        let timeout;
                        let limit = 4;
                        let currentNumberOfCalls = 0;
                        
                        console.log(`Got ${storeToUpdateProducts.length} products from ${storeToUpdate}`);
                        for(let i in storeToUpdateProducts){
                            let variants = storeToUpdateProducts[i].variants;
                            if(!doneProducts.includes(storeToUpdateProducts[i].id)){
                                for(let k in variants){
                                    // if(typeof variants[k].sku != null && masterSkus.includes(variants[k].sku) && variants[k].sku.includes("TEST_SKU")
                                    // &&  masterItems[variants[k].sku].quantity != variants[k].inventory_quantity ){
                                     if(timeout){
                                        
                                     }else{

                                     }
                                        let body = {
                                            location_id: store_location_id,
                                            inventory_item_id: variants[k].inventory_item_id,
                                         //   available: masterItems[variants[k].sku].quantity
                                            available: variants[k].inventory_quantity
                                        };
                                            console.log(`Setting ${variants[k].sku}  ${body.inventory_item_id} to ${body.available} at ${storeToUpdate}`);
                                            adjustedProductsCount++;
                                            allPromises.push( module.exports.postRequest(storeToUpdate, "inventory_levels/set.json", body));
                                    
                              //      }  
                                    doneProducts.push(storeToUpdateProducts[i].id);
                                }
                            }      
                        }

                        Promise.all(allPromises)
                        .then((values)=>{
                            values.forEach((item)=>{
                                console.log(`Set ${item}.`);
                            })
                            resolve(`Set ${adjustedProductsCount} products at ${storeToUpdate}`);
                        }).catch((error)=>{
                            console.log(error.error);
                        })
                    }else{
                        resolve(`No products at ${storeToUpdate}`);
                    }
                });   
               }else{
                resolve(`No products at ${masterStore}`);
               }
            });
          }else{
            resolve(`No store id for ${storeToUpdate}`);
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
                        let variants = [];
                        for (let product of products) {
                            for (let variant of product.variants) {
                                variants.push(variant);
                            }
                        }
                        console.log(`Got ${products.length} products, ${variants.length} variants from ${store}`);
                        for (let variant of variants) {
                            if (skus.includes(variant.sku)) {
                                let body = {
                                    location_id: store_location_id,
                                    inventory_item_id: variants[k].inventory_item_id,
                                    available_adjustment: -items[variants[k].sku].quantity
                                };
                                console.log(`Adjusting Inventory for Store: ${store}, InventoryItem ID: ${body.inventory_item_id}, SKU: ${variants[k].sku} by quantity: ${body.available_adjustment}`);
                                module.exports.postRequest(store, "inventory_levels/adjust.json", body).then((response) => {
                                    if (response.errors) {
                                        console.log(`ERRORS: ${response.errors}`);
                                    } else {
                                        console.log(`Adjusted ${response}.`);
                                    }
                                }).catch((err)=>{
                                    console.log(err);
                                });
                            }
                        }
                        console.log(`Finished adjusting products for ${store}.`);
                        resolve(`Finished adjusting products for ${store}.`);
                    }
                });
            }
        });
    },
   
    getAllProducts: function (store, products = []) {
       return new Promise((resolve, reject)=>{
            let link = "products.json?limit=250";
            if (products.length) {
                link = `${link}&since_id=${products[products.length-1].id}`
            }

            module.exports.getRequest(store, link).then((res) => {
                let newProducts = JSON.parse(res).products;
                if (newProducts.length) {
                    products = [...products, ...newProducts];
                    module.exports.getAllProducts(store, products).then(resolve);
                } else {
                    console.log(`Resolving getAllProducts for ${store} with ${products.length} total products`);
                    resolve(products);
                }
            });
       });
    },
     
    getOrderById: function(orderID) {
        console.log(getWebhookData);
        return db.oneOrNone(getWebhookData, [orderID]);
      
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
   queryWebhooks: function(){
        console.log(getWebhookData);
        return db.manyOrNone(`SELECT *
           FROM webhooks`);
          
            
   },
     
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
