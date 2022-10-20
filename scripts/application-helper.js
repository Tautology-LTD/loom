module.exports = {
    getStores: function (){
        return ["bailey", "dstld", "stateside"];
    },
    delay: function(ms) {
      return new Promise(function(resolve) {
        setTimeout(resolve, ms);
      });
    }
};