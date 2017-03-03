var express = require('express');
var app = express();
var os = require('os');
var ifaces = os.networkInterfaces();

var port = 8080;
var database = "NVector";
var collection = "fda";
var mongoServer = "192.168.1.12:27017";
//var mongoServer = "10.16.54.223:27017";

var option = null;
process.argv.forEach(function(val, index, array){
  if(option == null){
    if(val.includes("-")){
      option = val.charAt(1);
      if(option == 'h'){
        return;
      }
    }

  }
  else{
    switch(option){
      case "p":
        port = parseInt(val);
        break;
      case "d":
        database = val;
        break;
      case "c":
        collection = val;
        break;
      case "m":
        mongoServer = val;
        break;
    }

    option = null;
  }

});


if(option == 'h'){
  console.log("\nThis script initializes a server that boths serves the nvector" +
  " application as well as restful queries for NVector datastores. The following"+
  " are options to run the server with \n\n" +
  "-p : The port number that you would like for this server to listen on\n" +
  "-d : The name of the mongo database you wish to connect to\n" +
  "-c : The collection that graph files should be loaded from\n" +
  "-m : The IP address (including port number) of the mongodb server holding NVector data\n");
  return;
}


console.log("Server running");

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;


  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log("Connect at http://" + iface.address + ":" + port);
    }
    ++alias;
  });
});

app.get('/', function(req,res){
  res.send("this is your first express app");
});


app.listen(port, function(){

})
