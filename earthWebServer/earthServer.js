var static = require('node-static');
var os = require('os');
var dispatcher = require("httpdispatcher");
var mongoc = require('mongodb').MongoClient;
var url = require('url')

var fileServer = new static.Server('../earth');
var ifaces = os.networkInterfaces();

var port = 8080;
var database = "nvector";
var collection = "fda";
var mongoServer = "192.168.1.13:27017";


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

require('http').createServer(function (request, response) {
  dispatcher.dispatch(request, response);

}).listen(port);




dispatcher.onGet("/", function(req,res){

  req.addListener('end', function () {
      fileServer.serve(req, res);
  }).resume();
});


dispatcher.onGet("/showFDA",function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported: " + err );
      res.end("An error was returned. View developer console");
      return;
    }
    var col = db.collection(collection);
    var arr = col.find({},{"metadata":1}).toArray(function(err, results){
        res.end(JSON.stringify(results));

    });

  });
});

dispatcher.onGet("/getFDA", function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});

  var fileName = req.params["fileName"];
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported " + err);
      res.end("and error was returned. View developer console");
    }
    var col = db.collection(collection);
    col.findOne({"metadata.fileName":fileName},function(err,results){
      res.end(JSON.stringify(results));

    });
  });


});



dispatcher.onGet("/showLayers", function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});

  var fileName = req.params["fileName"];
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported: " + err );
      res.end("An error was returned. View developer console");
      return;
    }
    var col = db.collection(collection);
    var arr = col.find({},{"fileName":1}).toArray(function(err, results){
        res.end(JSON.stringify(results));

    });

  });


});


dispatcher.onGet("/getLayer", function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});

  var fileName = req.params["fileName"];
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported " + err);
      res.end("and error was returned. View developer console");
    }
    var col = db.collection(collection);
    col.findOne({"fileName":fileName},function(err,results){
      res.end(JSON.stringify(results));

    });
  });


});
