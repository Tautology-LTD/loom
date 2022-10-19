const tools = require("../scripts/function-library");
 
module.exports = function(app){
   
    app.get("/db/test", (req, res)=>{
        console.log("TESTING");
        // let insertReturn = tools.insertOrder({id: 80});
        // insertReturn.then((data)=>{
            // console.log(data);
            // tools.updateOrderById(80);
            // res.send("Inserted order.");
        // })
         
    });

    app.get("/db/create", (req, res)=>{
        // tools.createWebhookTable().then((response)=>{ // This  code wouldn't even run because removed createWebhookTable from the function library
        //     console.log(response);
        //     res.send("Table created");
        // }).catch((err)=>{
        //     console.log(err);
        //     res.send(err);
        // });;
    });
    app.get("/db/webhooks", (req, res)=>[
        tools.getWebhooksData().then((data)=>{
            res.render("webhooks.hbs", {webhooks: data});
        }).catch((err)=>{
            console.log(err);
            res.send(err);

        })
    ]);

}