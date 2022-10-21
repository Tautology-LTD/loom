const applicationHelper = require("../scripts/application-helper.js");
const productHelper = require("../scripts/product-helper.js");
const apiHelper = require("../scripts/api");
function validStore(store) {
    let allStores = applicationHelper.getStores();
    return allStores.includes(store);
}

module.exports = function(app){
    app.get("/sync", (req, res)=>{
        let stores = applicationHelper.getStores();
        res.render("sync/index.hbs", {stores});
    });

    app.get("/sync/:masterStore", (req, res)=>{
        let masterStore = req.params.masterStore;
        let otherStores = applicationHelper.getStores().filter((store)=> store != masterStore);

        if (!validStore(masterStore)) {
            res.redirect("/sync");
        }

        res.render("sync/sync.hbs", {masterStore, otherStores});
    });

    app.get("/sync/:masterStore/to/:storeToUpdate", (req, res)=>{
        let masterStore =  req.params.masterStore;
        let storeToUpdate =  req.params.storeToUpdate;
        
        if (!validStore(masterStore) || !validStore(storeToUpdate)) {
            res.redirect(`/sync/${masterStore}`);
        }

        res.render("sync/confirm.hbs", {masterStore, storeToUpdate});
    });

    app.post("/sync/:masterStore/to/:storeToUpdate", (req, res)=>{
        let masterStore = req.params.masterStore;
        let storeToUpdate = req.params.storeToUpdate;

        if (!validStore(masterStore) || !validStore(storeToUpdate) ){
            res.sendStatus(422);
        }

        console.log(`Syncing ${storeToUpdate}'s levels to the leveld of ${masterStore}`);
        let store_location_id = apiHelper.getStoreLocationId(storeToUpdate);

        if (!store_location_id) {         
            console.log(`No Location Id found for store: ${store}`);
            resolve(`No Location Id found for store: ${store}`);                  
        } else {
        
            productHelper.getAllProducts(masterStore).then((masterStoreProducts)=>{
    
                if (!masterStoreProducts.length) {
                    console.log(`No products at ${masterStoreProducts}`);
                    resolve(`No products at ${masterStoreProducts}`);
                } else {

                    let masterItems = productHelper.assembleItems(masterStoreProducts, `inventory_quantity`);
                    let masterSKUs = Object.keys(masterItems);

                    productHelper.getAllProducts(storeToUpdate).then((storeToUpdateProducts)=>{

                        console.log(`Got ${storeToUpdateProducts.length} products from ${storeToUpdate}`);
                        if (!storeToUpdateProducts.length) {
                            console.log(`No products at ${storeToUpdate}`);
                            resolve(`No products at ${storeToUpdate}`);
                        } else {
                            let allPromises = [];
                            let updates = [];
                          
                            let variants = productHelper.deduplicateVariants(storeToUpdateProducts);
                           
                        
                            variants = Object.values(variants); // de-duplicate the variants
                             console.log(`Now we have ${storeToUpdateProducts.length} products, ${variants.length} variants from ${storeToUpdate}`);

                            for (let variant of variants) {
                                
                                if (variant.sku.includes("TEST_SKU") && masterSKUs.includes(variant.sku) && masterItems[variant.sku].quantity !== variant.inventory_quantity) {
                                 // if(typeof variants[k].sku != null && masterSkus.includes(variants[k].sku) && variants[k].sku.includes("TEST_SKU")
                                 // &&  masterItems[variants[k].sku].quantity != variants[k].inventory_quantity ){
                                     let timeout = 0;
                                    
                                     updates.push(()=>{
                                        return new Promise((resolve, reject)=>{
                                            let body = {
                                                location_id: store_location_id,
                                                inventory_item_id: variant.inventory_item_id,
                                                available: masterItems[variant.sku].quantity
                                            };
                                            applicationHelper.delay(timeout).then(()=>{
                                                console.log(`Setting Inventory for Store: ${storeToUpdate}, SKU: ${variant.sku}, Variant ID: ${variant.id}, InventoryItem ID: ${body.inventory_item_id}, to quantity: ${body.available}`);                                              
                                                resolve(apiHelper.postRequest(storeToUpdate, "inventory_levels/set.json", body));
                                            });
                                            timeout += 250;
                                            
    
                                        });
                                       
                                    });
                                }
                            }
                             for (let updateFunction of updates) {
                                 allPromises.push(updateFunction());

                            }
 
                            Promise.all(allPromises).then((values)=>{
                                console.log(values);
                                res.redirect(`/sync/${masterStore}/to/${storeToUpdate}/done`);

                            }).catch((err)=>{
                                console.log(err);
                            })
                           
                        }

                    });

                }
            });
        }
        
        // inventoryHelper.updateStoreLevelByMaster(storeToUpdate, masterStore).then((response)=>{
        //     console.log(response);
        // });

        // get all the products from the master store
        // get all the products from the slave store
        // loop through slave products
            // if slave products appears in master store
                // push the slave product and the master products into an array of updates
                // updates = [function() {
                    // inventoryHelper.setInventoryForSku(store, sku, inventory);
                // }}]

        // establish a timeout variable at 0
        // loop through the closures assigning each to run after the timeout
        // delay(3000).then(() => alert('runs after 3 seconds'));
        // push the resulting promise in to an array of promises
        // increment time timeout by 250

        // wait for all the promises to resolve

        // res.redirect(`/sync/${masterStore}/to/${storeToUpdate}/done`);
    });

    app.get("/sync/:masterStore/to/:storeToUpdate/done", (req, res)=> {
        let masterStore = req.params.masterStore;
        let storeToUpdate = req.params.storeToUpdate;

        res.render("sync/done.hbs", {masterStore, storeToUpdate});
    });
    
    app.get("/sync/*", (req, res)=>{
        console.log("DEFAULT");
        res.redirect("/sync/index.hbs");
    });
}