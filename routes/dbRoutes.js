 const tools = require("../scripts/function-library");
 
module.exports = function(app){
   
    app.get("/db/test", (req, res)=>{
        console.log("TESTING");
    let insertReturn = tools.insertOrder({id: 80});
              insertReturn.then((data)=>{
                 console.log(data);
                tools.updateOrderById(80);
                res.send("Inserted order.");
            })
         
    });

    app.get("/db/create", (req, res)=>{
        tools.createWebhookTable().then((response)=>{
            console.log(response);
            res.send("Table created");
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        });;
    });
    app.get("/db/webhooks", (req, res)=>[
        tools.queryWebhooks().then((data)=>{
            res.send(data);
        }).catch((err)=>{
            console.log(err);
            res.send(err);

        })
    ]);

}