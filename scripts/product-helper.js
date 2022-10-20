const apiHelper = require('./api.js')

module.exports = {
	getAllProducts: function (store, products = []) {
       return new Promise((resolve, reject)=>{
            let limit = 250;
            let link = `products.json?limit=${limit}`;
            if (products.length) {
                link = `${link}&since_id=${products[products.length-1].id}`
            }

            apiHelper.getRequest(store, link).then((res) => {
                let newProducts = JSON.parse(res).products;
                products = [...products, ...newProducts];
                if (newProducts.length == limit) {
                    module.exports.getAllProducts(store, products).then(resolve);
                } else {
                    console.log(`Resolving getAllProducts for ${store} with ${products.length} total products`);
                    resolve(products);
                }
            });
       });
    },
    assembleItems: function (inputItems, quantityField) {
        let outputItems = {};
        for(let i = 0; i < inputItems.length; i++){
           if(inputItems[i].variants){ // if the item variants, create an outputItem for each
                let variants = inputItems[i].variants;
                for(let k = 0; k < variants.length; k++){
                    if(variants[k].sku != null){
                        outputItems[variants[k].sku] = {
                            quantity: variants[k][quantityField],
                            sku:  variants[k].sku
                        };
                    }
                }
            }else{ // otherwise create an outputItem from the item itself
                if(inputItems[i].sku != null){
                    outputItems[inputItems[i].sku] = {
                        quantity: inputItems[i][quantityField],
                        sku: inputItems[i].sku
                    };
                }
            }
        }
        return outputItems;
    }
}