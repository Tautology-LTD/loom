const request = require('request-promise');

module.exports = {
    getStoreURL: function (store){
        switch(store){
            case "bailey":
                return process.env.BAILEY_HOST;
                break;
            case "dstld":
                return process.env.DSTLD_HOST
                break;
            case "stateside":
                return process.env.STATESIDE_HOST;
                break;
        }
    },
    getShopifyToken: function (store){
        switch(store){
            case "bailey":
                return process.env.BAILEY_SHOPIFY_TOKEN;
                break;
            case "dstld":
                return process.env.DSTLD_SHOPIFY_TOKEN;
                break;
            case "stateside":
                return process.env.STATESIDE_SHOPIFY_TOKEN;
                break;
        }
    },
    getStoreLocationId: function (store){
        switch(store){
            case "bailey":
                return process.env.BAILEY_LOCATION_ID;
                break;
            case "dstld":
                return process.env.DSTLD_LOCATION_ID;
                break;
            case "stateside":
                return process.env.STATESIDE_LOCATION_ID;
                break;
            default:
                return 0;
                break;
        }
    },


    apiRequest: function (store, method, resource, body){
        return new Promise((resolve, reject)=>{
           
            let TOKEN = module.exports.getShopifyToken(store);
            if(TOKEN){
                let requestObject = {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': TOKEN
                    },
                    method: method,
                    uri: `https://${module.exports.getStoreURL(store)}/admin/api/${ process.env.API_VERSION}/${resource}`,

                }
                console.log(`${requestObject.method} ${requestObject.uri}`);   

                if(body){
                    requestObject.body = JSON.stringify(body);
                }
                request(requestObject).then(resolve).catch(reject);
            }else{
                reject(`No token found for ${store}`);
            }
        });
    },

    getRequest: function (store, resource, callback){
         return module.exports.apiRequest(store, "GET", resource);
    },
    postRequest: function (store, resource, body, callback){
         return module.exports.apiRequest(store, "POST", resource, body);

    },
    delRequest: function (store, resource, callback){
         return module.exports.apiRequest(store, "DELETE", resource);
    }
}