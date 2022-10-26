const webhookQueryHelper  = require("../db/webhooks");
 
module.exports = function(app){
   
    app.get("/db/test", (req, res)=>{
        webhookQueryHelper.insert(0, 'order/test', {}).then((data)=>{
            res.send(data);
        })
    });

    app.get("/db/create", (req, res)=>{
       if(process.env.NODE_ENV != "development"){
        res.redirect("/");
       }else{
        webhookQueryHelper.createTable().then((response)=>{ 
            console.log(response);
            res.send("Table created");
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        });;
       }
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
    app.get("/db/webhooks/:id/reenqueue", (req, res)=>{
        let webhookId = req.params.id;
        
        const Queue = require('bee-queue');
        const queue = new Queue('webhooksQueue');
    
        const job = queue.createJob({webhookId});
        job.save();
        job.on('succeeded', (result) => {
            console.log(`Received result for job ${job.id}: ${result}`);
            res.redirect(`/db/webhooks/${webhookId}`);
        });
     
    });
}