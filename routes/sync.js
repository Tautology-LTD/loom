const applicationHelper = require("../scripts/application-helper.js");
const inventoryHelper = require("../scripts/inventory-helper.js");
const multer  = require('multer');
const upload = multer();
const fs = require("fs");
 
function validStore(store) {
    let allStores = applicationHelper.getStores();
    return allStores.includes(store);
}

module.exports = function(app){
    app.get("/sync", (req, res)=>{
        let stores = applicationHelper.getStores();
        res.render("sync/index.hbs", {stores});
    });

    app.get("/sync/upload", (req, res)=>{
        res.render("sync/upload.hbs");
    });

    app.post("/sync/upload",  upload.single('update'), (req, res)=>{
        console.log(req.file.buffer.toString());
        let items = applicationHelper.parseCSV(req.file.buffer.toString());
        let stores = applicationHelper.getStores();
        let allPromises = [];
        console.log(items);

        for(let i in stores){
           allPromises.push(inventoryHelper.setStoreLevelsBySkus(stores[i], items));

        }
        Promise.all(allPromises).then((values)=>{
            res.redirect("/sync/upload/done");

        })
            
       
    });
    app.get("/sync/upload/done", (req, res)=>{
        res.render("sync/upload_done.hbs");
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

        inventoryHelper.setStoreInventoryLevels(masterStore, storeToUpdate).then((values)=>{
            res.redirect(`/sync/${masterStore}/to/${storeToUpdate}/done`);
        })
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