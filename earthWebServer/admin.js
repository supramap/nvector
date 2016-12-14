/** This file servs as a an admin control panel for the server. */

// this should be re-written as an admin tool but for now I just want things to
// work...

var querystring = require('querystring');
var http = require('http');
var bcrypt = require('bcrypt');


function CreateUser(userName, password) {
  // Build the post string from an object
  var post_data = querystring.stringify({
      'usrName' : userName,
      'passw': password
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '8080',
      path: '/createUser',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });


  // post the data
  post_req.write(post_data);
  post_req.end();

}


function CreateGroup(user,groupName){

  var post_data = querystring.stringify({
      'usrName' : user,
      'groupName': groupName
  });

  var post_options = {
      host: 'localhost',
      port: '8080',
      path: '/createGroup',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  };

  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });


  // post the data
  post_req.write(post_data);
  post_req.end();


}



function addUserToGroup(user,groupName){

  var post_data = querystring.stringify({
      'usrName' : user,
      'groupName': groupName
  });

  var post_options = {
      host: 'localhost',
      port: '8080',
      path: '/addUserToGroup',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  };

  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });


  // post the data
  post_req.write(post_data);
  post_req.end();


}

//CreateUser("zach", "passed");
//CreateGroup("zach","UNCC");
addUserToGroup("fud","UNCC");
