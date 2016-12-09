var static = require('node-static');
var os = require('os');
var httpDispatcher = require("httpdispatcher");
var dispatcher = new httpDispatcher();
var mongoc = require('mongodb').MongoClient;
var url = require('url');
var bcrypt = require('bcrypt');

var fileServer = new static.Server('../earth');
var ifaces = os.networkInterfaces();

var port = 8080;
var database = "NVector";
var collection = "fda";
//var mongoServer = "192.168.1.11:27017";
var mongoServer = "10.16.54.223:27017";

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



/**
  This should display the application
*/
dispatcher.onGet("/", function(req,res){

  req.addListener('end', function () {
      fileServer.serve(req, res);
  }).resume();
});


/**
  return a list of all of the existing data graphs.
*/
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
/**
  return the fda graph selected by the user.
*/
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


/**
  Catch the showLayers request and return the avialable layers as provided in the
  database.
*/
dispatcher.onGet("/showLayers", function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});

  var fileName = req.params["fileName"];
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported: " + err );
      res.end("An error was returned. View developer console");
      return;
    }
    var col = db.collection("layers");
    var arr = col.find({},{"fileName":1}).toArray(function(err, results){
        res.end(JSON.stringify(results));

    });

  });


});

/**
  when a request to getLayer is recieved send the json object that forms the layer
  to be displayed in NVector
*/
dispatcher.onGet("/getLayer", function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});
  var fileName = req.params["fileName"];
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported " + err);
      res.end("and error was returned. View developer console");
    }
    var col = db.collection("layers");
    col.findOne({"fileName":fileName},function(err,results){
      res.end(JSON.stringify(results));

    });
  });


});



/**
This is our newly added code to recieve requests on user data including userName
and groups.
We get to use Post from this point ;)
==========================================================================
**/


/**
  This will not be called from the NVector application. Think the server admin
  should be responsible for creating users.
*/
dispatcher.onPost("/createUser", function(req,res){
  res.writeHead(200, {'Content-Type': 'application/json'});

  var userName = req.params["usrName"];
  var passw = req.params["passw"];
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported " + err);
      res.end("and error was returned. View developer console");
    }//end if
    // in this case create the salt for the hashing algorithm
    bcrypt.genSalt(5, function(err,salt){
        bcrypt.hash(passw,salt,function(err, hash ){
          db.collection('users').insertOne({

              "userName": userName,
              "passw": hash,


          },function(err,enMess){
            if(err){
              console.log("The user was not successfully added to the database: " + err);
            }
            else{
              res.end(JSON.stringify({"result": enMess}));
            }
          });
        });
    });// salted


    res.end(JSON.stringify({"status" : "successful"}));

  });// end mongodb connection
});// end of post



/**
  This is the listener for sign in requests. Every thing is sent via post
  to obscure data as much as possible. The username and password are then checked
  against the hashing algorithm and compared to the one stored in the database.
  On success a message is returned stating the success. 
*/
dispatcher.onPost("/signIn", function(req,res){
  console.log("user request attempted");
  res.writeHead(200, {'Content-Type': 'application/json'});

  var usr= req.params["usrName"];
  var pasw = req.params["passw"];
  mongoc.connect("mongodb://"+mongoServer+"/"+database, function(err,db){
    if(err){
      console.log("an error was reported " + err);
      res.end("and error was returned. View developer console");
    }//end if
    var col = db.collection("users");
    col.findOne({"userName":usr},function(err,results){
      console.log("results: " + Object.keys(results));

      bcrypt.compare(pasw,results.passw, function(err, success){
        if(err){
          console.log("Error found: " + err);
        }
        if(success){
          res.end(JSON.stringify({"login":true , "userName" : usr}));
        }
        else{
          res.end(JSON.stringify({"login":false , "userName" : usr}));
        }
      });

    });// end of fineOne column
  });// end mongodb connection
});// end of post
