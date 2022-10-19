module.exports = {
    json: function(object){
        return JSON.stringify(object);
    },
    capitalize: function(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}