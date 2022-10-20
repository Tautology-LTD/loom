const applicationHelper = require("../scripts/application-helper.js");

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
        let allStores = applicationHelper.getStores();

        if (!validStore(masterStore) || !validStore(storeToUpdate) ){
            res.sendStatus(422);
        }
        // inventoryHelper.updateStoreLevelByMaster(storeToUpdate, masterStore).then((response)=>{
        //     console.log(response);
        // });
        res.redirect(`/sync/${masterStore}/to/${storeToUpdate}/done`);
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