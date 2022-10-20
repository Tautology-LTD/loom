const webhookQueryHelper  = require("../db/webhooks");
 
module.exports = function(app){
   
    app.get("/db/test", (req, res)=>{
        webhookQueryHelper.insert(0, 'order/test', {}).then((data)=>{
            res.send(data);
        })
    });

    app.get("/db/create", (req, res)=>{
        // webhookQueryHelper.createTable().then((response)=>{ // This  code wouldn't even run because removed createWebhookTable from the function library
        //     console.log(response);
        //     res.send("Table created");
        // }).catch((err)=>{
        //     console.log(err);
        //     res.send(err);
        // });;
    });
    app.get("/db/webhooks", (req, res)=>[
        webhookQueryHelper.all().then((data)=>{
            res.render("webhooks.hbs", {webhooks: data});
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        })
    ]);
    app.get("/db/webhooks/:id", (req, res)=>[
        webhookQueryHelper.find(req.params.id).then((data)=>{
            res.render("webhooks.hbs", {webhooks: data});
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        })
    ]);
}