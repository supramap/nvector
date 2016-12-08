// This file is responsible for client server interaction associated with server
// connections and groups.

/**
  The listAvailableGroups function is designed to query the currently connected
  server with current signed in user credentials.
*/
function listAvailableGroups(){
  $.ajax({
    type: "POST",
    data: "sdaf",
    url:(queryroot + "/listGroup"),
    success:function(finished){
      console.log("listing available groups");
    }
  });
}

/**
  The addGroup function is design to utilize the user's sign in credentials to
  create a new user group that allows data to be shared
*/
function addGroup(){
  $.ajax({
    type: "POST",
    url:(queryroot + "/addGroup"),
    data: "sdaf",
    success:function(finished){
      console.log("finished the addgroup query");
    }
  });
}

/**
  the viewGroupUsers function is designed to allow a user to view the other
  users that they share a group with.
*/
function viewGroupUsers(){
  $.ajax({
    type: "POST",
    data: "sdaf",
    url:(queryroot + "/viewUsers"),
    success:function(finished){
      console.log("finished the addgroup query");
    }
  });
}


/**
  AddUserToGroup allows for a user to add others to a newly create group
*/
function addUserToGroup(){
  $.ajax({
    type: "POST",
    data: "sdaf",
    url:(queryroot + "/addToGroup"),
    success:function(finished){
      console.log("finished the addgroup query");
    }
  });
}

/**
  Signin
*/
function signInUser(){
  // get the user's credentials from the options panel
  var lastroot = queryroot;
  queryroot = $("#server").val();
  var userName = $("#userName").val();
  var passw = $("#passwd").val();
  $.ajax({
    type: "POST",
    data: {"usrName" : userName, "passw" : passw},
    url:(queryroot + "/signIn"),
    success:function(finished){
      if(finished.login == true){
        console.log("logged in now change status");
        $("#logStatus").html("Logged In");
        $("#logStatus").addClass("statusGreen");

      }
      else{
        console.log("password is incorrect");
        queryroot = lastroot;
      }
    }
  });
}
