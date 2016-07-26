var static = require('node-static');
var os = require('os');
var dispatcher = require("httpdispatcher");
var mongoc = require('mongodb').MongoClient;
var url = require('url')

var fileServer = new static.Server('../earth');
var ifaces = os.networkInterfaces();

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
      console.log("Connect at http://" + iface.address + ":8081");
    }
    ++alias;
  });
});

require('http').createServer(function (request, response) {
  dispatcher.dispatch(request, response);

}).listen(8081);




dispatcher.onGet("/", function(req,res){

  req.addListener('end', function () {
      fileServer.serve(req, res);
  }).resume();
});


dispatcher.onGet("/showFDA",function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});
  mongoc.connect("mongodb://192.168.1.13:27017/nvector", function(err,db){
    if(err){
      console.log("an error was reported: " + err );
      res.end("An error was returned. View developer console");
      return;
    }
    var col = db.collection('fda');
    var arr = col.find({},{"metadata":1}).toArray(function(err, results){
        res.end(JSON.stringify(results));

    });

  });
});

dispatcher.onGet("/getFDA", function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});

  var fileName = req.params["fileName"];
  mongoc.connect("mongodb://192.168.1.13:27017/nvector", function(err,db){
    if(err){
      console.log("an error was reported " + err);
      res.end("and error was returned. View developer console");
    }
    var col = db.collection('fda');
    col.findOne({"metadata.fileName":fileName},function(err,results){
      res.end(JSON.stringify(results));

    });
  });


});
