const apiHelper = require('./api.js');
const productHelper = require('./product-helper.js');

module.exports = {
   
    updateStoreInventoryBySkus: function (store, line_items){
        return new Promise((resolve, reject)=>{
            let items = productHelper.assembleItems(line_items, `fulfillable_quantity`);
            let skus = Object.keys(items);
            console.log(`Update Store Inventory By SKUS, Store: ${store}, Total Items: ${Object.keys(items).length}, SKUs: ${skus.join(', ')}`)
            let store_location_id = apiHelper.getStoreLocationId(store);
                        
            if (!skus.length) {
                console.log(`No matching items found for store ${store}.`);
                resolve(`No matching items found for store ${store}.`);
            } else if (!store_location_id) {
                console.log(`No Location Id found for store: ${store}`);
                resolve(`No Location Id found for store: ${store}`);
            } else {
                productHelper.getAllProducts(store).then((products) => {
                    if (!products) {
                        console.log(`No products at ${store}`);
                        resolve(`No products at ${store}`);
                    } else {
                        let allPromises = [];
                        let variants = productHelper.deduplicateVariants(products);

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
                                allPromises.push(apiHelper.postRequest(store, "inventory_levels/adjust.json", body));
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
    }
}