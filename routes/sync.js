const tools = require("../scripts/function-library");
const webhookQueryHelper  = require("../db/webhooks");
 
module.exports = function(app){
   
    app.get("/sync", (req, res)=>{
        let stores = tools.getStores();
        res.render("sync.hbs", {step:1, stores, header: "Which store would you like to sync from?"});
    });

    app.get("/sync/:masterStore", (req, res)=>{
        let allStores =  tools.getStores();
        let masterStore =  req.params.masterStore;
        let stores = allStores.filter((store)=> store != masterStore);
        if(!allStores.includes(masterStore)){
            res.redirect("/sync");
        }
        console.log(masterStore);
        stores.push("all");
        res.render("sync.hbs", {step:2, stores, masterStore, header:"Which store would you like to sync to?"});
    });

    app.get("/sync/:masterStore/to/:storeToUpdate", (req, res)=>{
        let masterStore =  req.params.masterStore;
        let storeToUpdate =  req.params.storeToUpdate;
        let allStores =  tools.getStores();
        allStores.push("all");
        
        if(!allStores.includes(masterStore) || !allStores.includes(storeToUpdate) ){
            res.redirect("/sync");
        }
        res.render("sync.hbs", {step:3, masterStore, storeToUpdate, header: `Are you sure you want to sync ${masterStore} to ${storeToUpdate}?`});
    });

    app.post("/sync/:masterStore/to/:storeToUpdate", (req, res)=>{
        let masterStore =  req.params.masterStore;
        let storeToUpdate =  req.params.storeToUpdate;
        let allStores =  tools.getStores();
        console.log(storeToUpdate, masterStore);
        if(!allStores.includes(masterStore) || !allStores.includes(storeToUpdate) ){
            res.sendStatus(500);
        }
        // tools.updateStoreLevelByMaster(storeToUpdate, masterStore).then((response)=>{
        //     console.log(response);
        // });
    });
    
    app.get("/sync/*", (req, res)=>{
        console.log("DEFAULT");
        res.redirect("/sync");
    });
}