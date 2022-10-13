const request = require('request-promise');

module.exports = {

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
                if(body){
                    requestObject.body = JSON.stringify(body);
                }
                console.log("Requesting...");   
                request(requestObject).then(resolve);
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
            let store_location_id = module.exports.getStoreLocationId(storeToUpdate);

            module.exports.getAllProducts(masterStore).then((masterStoreProducts)=>{
                module.exports.getAllProducts(storeToUpdate).then((storeToUpdateProducts)=>{
                    
                });   
            });
        });

    },

    updateStoreInventoryBySkus: function (store, items){
       return new Promise((resolve, reject)=>{
        if(items){
            let store_location_id = module.exports.getStoreLocationId(store);
            let skus = [];
            for(let sku in items){
                skus.push(sku);
            }
            console.log(skus);
            if(store_location_id){
                module.exports.getAllProducts(store).then((products)=>{
                    console.log(`Got ${products.length} products from ${store}`);
                    let adjustedProductsCount = 0;
                    if(products){
                        for(let i in products){
                            let variants = products[i].variants;
                            for(let k in variants){
                                if(skus.includes(variants[k].sku)){
                                    let body = {
                                        location_id: store_location_id,
                                        inventory_item_id: variants[k].inventory_item_id,
                                        available_adjustment: -items[variants[k].sku].quantity
                                    };
                                        console.log(`Adjusting ${body.inventory_item_id} by ${body.available_adjustment}`);
                                        adjustedProductsCount++;
                                        module.exports.postRequest(store, "inventory_levels/adjust.json", body).then((response)=>{
                                            if(response.errors){
                                                console.log(`ERRORS: ${response.errors}`);
                                            }else{
                                                console.log(`Adjusted ${response}.`);
                                            }
                                        }).catch((err)=>{
                                            console.log(err);
                                        });
                                
                                }  
                            }      
                        }
                        console.log(`Finished adjusting ${adjustedProductsCount} products.`);
                        resolve(`Finished attempting to adjust ${adjustedProductsCount} products.`);

                    }else{
                        console.log(`No products at ${store}`);

                        resolve(`No products at ${store}`);
                    }
                });
            }else{
                console.log(`No location Id for store: ${store}`);
                resolve(`No location Id for store: ${store}`);
            }
        
        }else{
            console.log(`No items.`);
            resolve(`No items.`);
        }
                
       });
    },
   
    getAllProducts: function (store, link, oldProducts){
       return new Promise((resolve, reject)=>{

            if(!link){//if no link, then first call
                link = "products.json?limit=250";
            }  
            console.log(`Sending GET request to ${link} for ${store}`);

            module.exports.getRequest(store, link).then((res)=>{
                
                // let headers = res.getHeaders();

                let newProducts = JSON.parse(res).products;
                
                // let nextPageInfo = headers.link.split(",");
                // for(let i in nextPageInfo){
                //     if(nextPageInfo[i].includes("next")){
                //         nextPageLink = nextPageInfo[i].split(">;")[0].split(`${process.env.API_VERSION}/`)[1];
                //     }
                // }
                let products = [];
                if(newProducts.length){
                    console.log("Assembling array of products...")
                    if(oldProducts){
                        products = [...oldProducts, ...newProducts];
                    }else{
                        products = newProducts;
                    }   
                    console.log(`Number of products so far: ${products.length}`);
                    let nextPageLink = `products.json?limit=250&since_id=${products[products.length-1].id}`
                
                    module.exports.getAllProducts(store, nextPageLink, products).then(resolve);

                }else if(oldProducts){
                    console.log("Old products")
                    console.log(`Resolving promise with ${oldProducts.length} products`);
                    resolve(oldProducts);
                }else{
                    console.log(`Resolving promise with ${products.length} products`);
                    resolve(products);
                }
                
            });
       });
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
