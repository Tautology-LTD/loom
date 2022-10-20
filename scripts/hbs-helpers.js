module.exports = {
    json: function(object) {
        return JSON.stringify(object);
    },
    capitalize: function(string) { 
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    switch: function(value, options) {
        this.switch_value = value;
        return options.fn(this);
    },
    case: function(value, options) {
        if (value == this.switch_value) {
          return options.fn(this);
        }
    }
}