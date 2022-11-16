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
        let items = applicationHelper.parseCSV(req.file.buffer.toString());
        let stores = applicationHelper.getStores();
        let allPromises = [];
 
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
      
    });

    app.get("/sync/:masterStore/to/:storeToUpdate/done", (req, res)=> {
        let masterStore = req.params.masterStore;
        let storeToUpdate = req.params.storeToUpdate;

        res.render("sync/done.hbs", {masterStore, storeToUpdate});
    });
    
    app.get("/sync/*", (req, res)=>{
        res.redirect("/sync/index.hbs");
    });
}