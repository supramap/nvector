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
  Signin the current user.
*/
var currentUser;
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
        currentUser = userName;
        console.log("logged in now change status");
        $("#logStatus").html("Logged In");
        $("#logStatus").addClass("statusGreen");
        $("#currentServer").html(queryroot);

      }
      else{
        console.log("password is incorrect");
        queryroot = lastroot;
      }
    }
  });
}




function checkGroups(){
  if(!currentUser){
    // make sure that the currrent user is signed in
    return;
  }
  else{
    $.ajax({
        type: "POST",
        data:{},
        url:(queryroot + "/showGroups"),
        success: function(results){
          var groupnames = results.groups;
          for(var i = 0; i < groupnames.length; i++){
            var currentGroup = $("div").append("<span class='groupText'>" + groupnames[i] + "</span>");
            currentGroup.append("<input type='image' class='gear2' src='images/gear1.svg' value='"+groupNames[i]+"'>");
            $("#groupManagement").append(currentGroup);
          }
        }
    });
  }
}


$("#addGroupBut").click(function(){
  if(!currentUser){
    alert("you need to be loggged in before you can create a group. The default server has no groups");
    return;
  }
  else{
    $("#ngplacement").show();
  }
});

$("#confirmGroup").click(function(){
  var newGroup = $("#newGroupName").val();
  $.ajax({
    type:"POST",
    data: {"usrName" : currentUser, "groupName" : newGroup},
    url: (queryroot + "/createGroup"),
    success: function(results){
      var currentGroup = document.createElement("div");
      $(currentGroup).append("<span class='groupText'>" + newGroup + "</span>");
      $(currentGroup).append("<input type='image' class='gear2' src='images/gear1.svg' value='"+newGroup+"'>");
      $(currentGroup).addClass("currentGroups");
      $("#groupManagement").append(currentGroup);
      $("#ngplacement").hide();
    }
  });
});
