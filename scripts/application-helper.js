module.exports = {
    getStores: function (){
        return ["bailey", "dstld", "stateside"];
    },
    delay: function(ms) {
      return new Promise(function(resolve) {
        setTimeout(resolve, ms);
      });
    },
    parseCSV: function(csv_string){
      let lines = csv_string.split(/\r?\n/);
      console.log("lines:", lines);
      let headers = lines[0].split(",");
      console.log("headers:", headers);

      lines.shift();
      console.log("new lines: ", lines);

      let data = [];
      for(let i in lines){
         let bits = lines[i].split(",");
         let lineObjects = {};
        for(let k = 0; k < bits.length; k++){
           lineObjects[headers[k].toLowerCase()] = bits[k];
        }
        data.push(lineObjects);
      }
       return data;
    }
};