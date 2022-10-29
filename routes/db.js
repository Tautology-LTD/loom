const webhookQueryHelper  = require("../db/webhooks");
const migrations = {
    init: require("../db//migrations/1-init"),
    alterReceived: require("../db//migrations/2-alter-received"),
    alterExecuted: require("../db//migrations/3-alter-executed"),
    addStoreName: require("../db//migrations/4-add-store-name-column")
};

module.exports = function(app){
   
    app.get("/db/migration/0", (req, res)=>{
        if(process.env.NODE_ENV != "development"){
         res.redirect("/");
        }else{
            webhookQueryHelper.query(migrations.init.generateSql()).then((data)=>{
                res.send(data);
            })
        }
     });
   
    app.get("/db/migration/1", (req, res)=>{
        webhookQueryHelper.query(migrations.alterReceived.generateSql()).then((data)=>{
            res.send(data);
        })
    });

    app.get("/db/migration/2", (req, res)=>{
        webhookQueryHelper.query(migrations.alterExecuted.generateSql()).then((data)=>{
            res.send(data);
        })
    });

    app.get("/db/migration/3", (req, res)=>{
        //`ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS store_name VARCHAR; UPDATE webhooks SET store_name = LEFT(payload::json->>'order_status_url', position('.' in payload::json->>'order_status_url'));`
        webhookQueryHelper.query(migrations.addStoreName.generateSql()).then((data)=>{
            res.send(data);
        })
    });

    app.get("/db/test", (req, res)=>{
        webhookQueryHelper.insert( "bailey", Date.now(), 'order/test', `{
            "id":4985395020011,
            "admin_graphql_api_id":"gid://shopify/Order/4985395020011",
            "app_id":580111,
            "browser_ip":"76.91.15.174",
            "buyer_accepts_marketing":true,
            "cancel_reason":null,
            "cancelled_at":null,
            "cart_token":"0d68afc78ca4f007618a49af6d61e15c",
            "checkout_id":33224164475115,
            "checkout_token":"7a38b519e3b02bdeefa6f9cb23c3fd5a",
            "client_details":{
               "accept_language":"en-US,en;q=0.9",
               "browser_height":540,
               "browser_ip":"76.91.15.174",
               "browser_width":375,
               "session_hash":null,
               "user_agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
            },
            "closed_at":null,
            "confirmed":true,
            "contact_email":"ghekko77@gmail.com",
            "created_at":"2022-10-17T22:51:06-07:00",
            "currency":"USD",
            "current_subtotal_price":"81.60",
            "current_subtotal_price_set":{
               "shop_money":{
                  "amount":"81.60",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"81.60",
                  "currency_code":"USD"
               }
            },
            "current_total_discounts":"20.40",
            "current_total_discounts_set":{
               "shop_money":{
                  "amount":"20.40",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"20.40",
                  "currency_code":"USD"
               }
            },
            "current_total_duties_set":null,
            "current_total_price":"89.36",
            "current_total_price_set":{
               "shop_money":{
                  "amount":"89.36",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"89.36",
                  "currency_code":"USD"
               }
            },
            "current_total_tax":"7.76",
            "current_total_tax_set":{
               "shop_money":{
                  "amount":"7.76",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"7.76",
                  "currency_code":"USD"
               }
            },
            "customer_locale":"en-US",
            "device_id":null,
            "discount_codes":[
               {
                  "code":"FORYOU20",
                  "amount":"20.40",
                  "type":"percentage"
               }
            ],
            "email":"ghekko77@gmail.com",
            "estimated_taxes":false,
            "financial_status":"paid",
            "fulfillment_status":null,
            "gateway":"paypal",
            "landing_site":"/products/linen-blend-front-tie-shirt-in-white?variant=42715069481195&currency=USD&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&gclid=CjwKCAjw-rOaBhA9EiwAUkLV4v-MBO7mAJFUvX7LrjBLZ8XJq37WM1lHdFUSLooPGCfH6zqoqSKoZhoCMXEQAvD_BwE",
            "landing_site_ref":null,
            "location_id":null,
            "merchant_of_record_app_id":null,
            "name":"#10197",
            "note":null,
            "note_attributes":[
               {
                  "name":"irclickid",
                  "value":"~d758c~ej-d~8937YWX28ZPQNPWPQIAqnrqgfg897650PHzwlhd-2"
               }
            ],
            "number":9197,
            "order_number":10197,
            "order_status_url":"https://shopstateside.us/31048168/orders/eaebb5abeb85069c66461a188f72c56f/authenticate?key=016dd079e82edb811bd8b1f39a76f31c",
            "original_total_duties_set":null,
            "payment_gateway_names":[
               "paypal"
            ],
            "phone":null,
            "presentment_currency":"USD",
            "processed_at":"2022-10-17T22:51:05-07:00",
            "processing_method":"express",
            "reference":null,
            "referring_site":"https://www.google.com/",
            "source_identifier":null,
            "source_name":"web",
            "source_url":null,
            "subtotal_price":"81.60",
            "subtotal_price_set":{
               "shop_money":{
                  "amount":"81.60",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"81.60",
                  "currency_code":"USD"
               }
            },
            "tags":"",
            "tax_lines":[
               {
                  "price":"5.92",
                  "rate":0.0725,
                  "title":"California State Tax",
                  "price_set":{
                     "shop_money":{
                        "amount":"5.92",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"5.92",
                        "currency_code":"USD"
                     }
                  },
                  "channel_liable":false
               },
               {
                  "price":"1.84",
                  "rate":0.0225,
                  "title":"Los Angeles County Tax",
                  "price_set":{
                     "shop_money":{
                        "amount":"1.84",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"1.84",
                        "currency_code":"USD"
                     }
                  },
                  "channel_liable":false
               }
            ],
            "taxes_included":false,
            "test":false,
            "token":"eaebb5abeb85069c66461a188f72c56f",
            "total_discounts":"20.40",
            "total_discounts_set":{
               "shop_money":{
                  "amount":"20.40",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"20.40",
                  "currency_code":"USD"
               }
            },
            "total_line_items_price":"102.00",
            "total_line_items_price_set":{
               "shop_money":{
                  "amount":"102.00",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"102.00",
                  "currency_code":"USD"
               }
            },
            "total_outstanding":"0.00",
            "total_price":"89.36",
            "total_price_set":{
               "shop_money":{
                  "amount":"89.36",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"89.36",
                  "currency_code":"USD"
               }
            },
            "total_shipping_price_set":{
               "shop_money":{
                  "amount":"0.00",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"0.00",
                  "currency_code":"USD"
               }
            },
            "total_tax":"7.76",
            "total_tax_set":{
               "shop_money":{
                  "amount":"7.76",
                  "currency_code":"USD"
               },
               "presentment_money":{
                  "amount":"7.76",
                  "currency_code":"USD"
               }
            },
            "total_tip_received":"0.00",
            "total_weight":453,
            "updated_at":"2022-10-17T22:51:11-07:00",
            "user_id":null,
           
            "line_items":[
               {
                  "id":12705125925099,
                  "admin_graphql_api_id":"gid://shopify/LineItem/12705125925099",
                  "fulfillable_quantity":1,
                  "fulfillment_service":"manual",
                  "fulfillment_status":null,
                  "gift_card":false,
                  "grams":227,
                  "name":"Linen Blend Front Tie Shirt in Black - M",
                  "pre_tax_price":"40.80",
                  "pre_tax_price_set":{
                     "shop_money":{
                        "amount":"40.80",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"40.80",
                        "currency_code":"USD"
                     }
                  },
                  "price":"51.00",
                  "price_set":{
                     "shop_money":{
                        "amount":"51.00",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"51.00",
                        "currency_code":"USD"
                     }
                  },
                  "product_exists":true,
                  "product_id":7653917294827,
                  "properties":[
                     
                  ],
                  "quantity":1,
                  "requires_shipping":true,
                  "sku":"TEST_SKU_1_M",
                  "taxable":true,
                  "title":"Linen Blend Front Tie Shirt in Black",
                  "total_discount":"0.00",
                  "total_discount_set":{
                     "shop_money":{
                        "amount":"0.00",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"0.00",
                        "currency_code":"USD"
                     }
                  },
                  "variant_id":42715059519723,
                  "variant_inventory_management":"shopify",
                  "variant_title":"M",
                  "vendor":"STATESIDE Sale",
                  "tax_lines":[
                     {
                        "channel_liable":false,
                        "price":"2.96",
                        "price_set":{
                           "shop_money":{
                              "amount":"2.96",
                              "currency_code":"USD"
                           },
                           "presentment_money":{
                              "amount":"2.96",
                              "currency_code":"USD"
                           }
                        },
                        "rate":0.0725,
                        "title":"California State Tax"
                     },
                     {
                        "channel_liable":false,
                        "price":"0.92",
                        "price_set":{
                           "shop_money":{
                              "amount":"0.92",
                              "currency_code":"USD"
                           },
                           "presentment_money":{
                              "amount":"0.92",
                              "currency_code":"USD"
                           }
                        },
                        "rate":0.0225,
                        "title":"Los Angeles County Tax"
                     }
                  ],
                  "duties":[
                     
                  ],
                  "discount_allocations":[
                     {
                        "amount":"10.20",
                        "amount_set":{
                           "shop_money":{
                              "amount":"10.20",
                              "currency_code":"USD"
                           },
                           "presentment_money":{
                              "amount":"10.20",
                              "currency_code":"USD"
                           }
                        },
                        "discount_application_index":0
                     }
                  ]
               },
               {
                  "id":12705125957867,
                  "admin_graphql_api_id":"gid://shopify/LineItem/12705125957867",
                  "fulfillable_quantity":1,
                  "fulfillment_service":"manual",
                  "fulfillment_status":null,
                  "gift_card":false,
                  "grams":227,
                  "name":"Linen Blend Front Tie Shirt in White - M",
                  "pre_tax_price":"40.80",
                  "pre_tax_price_set":{
                     "shop_money":{
                        "amount":"40.80",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"40.80",
                        "currency_code":"USD"
                     }
                  },
                  "price":"51.00",
                  "price_set":{
                     "shop_money":{
                        "amount":"51.00",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"51.00",
                        "currency_code":"USD"
                     }
                  },
                  "product_exists":true,
                  "product_id":7653918867691,
                  "properties":[
                     
                  ],
                  "quantity":1,
                  "requires_shipping":true,
                  "sku":"TEST_SKU_2_L",
                  "taxable":true,
                  "title":"Linen Blend Front Tie Shirt in White",
                  "total_discount":"0.00",
                  "total_discount_set":{
                     "shop_money":{
                        "amount":"0.00",
                        "currency_code":"USD"
                     },
                     "presentment_money":{
                        "amount":"0.00",
                        "currency_code":"USD"
                     }
                  },
                  "variant_id":42715069481195,
                  "variant_inventory_management":"shopify",
                  "variant_title":"M",
                  "vendor":"STATESIDE Sale",
                  "tax_lines":[
                     {
                        "channel_liable":false,
                        "price":"2.96",
                        "price_set":{
                           "shop_money":{
                              "amount":"2.96",
                              "currency_code":"USD"
                           },
                           "presentment_money":{
                              "amount":"2.96",
                              "currency_code":"USD"
                           }
                        },
                        "rate":0.0725,
                        "title":"California State Tax"
                     },
                     {
                        "channel_liable":false,
                        "price":"0.92",
                        "price_set":{
                           "shop_money":{
                              "amount":"0.92",
                              "currency_code":"USD"
                           },
                           "presentment_money":{
                              "amount":"0.92",
                              "currency_code":"USD"
                           }
                        },
                        "rate":0.0225,
                        "title":"Los Angeles County Tax"
                     }
                  ],
                  "duties":[
                     
                  ],
                  "discount_allocations":[
                     {
                        "amount":"10.20",
                        "amount_set":{
                           "shop_money":{
                              "amount":"10.20",
                              "currency_code":"USD"
                           },
                           "presentment_money":{
                              "amount":"10.20",
                              "currency_code":"USD"
                           }
                        },
                        "discount_application_index":0
                     }
                  ]
               }
            ]
         }`).then((data)=>{
            res.send(data);
        })
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