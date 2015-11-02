var queryroot = "http://10.16.56.69:8080/irods-rest/rest/"

// Make the buttons trigger the file selector
$("#infileBut").click(function(){
  $("#infile").trigger('click');
});

$("#layerBut").click(function(){
  $("#layerFile").trigger('click');
});


$("#infileButCloud").click(function(){
  // fire off the query to retrieve collection information.
  // while waiting for collection information be sure to display the popup
  // window and a loading animation.
  layOrGraph = "graph";
  var list = "collection/tempZone/home/zach/fda?listing=true"
  loading();
  $.ajax({
    type:"GET",
    url:(queryroot + list),
    beforeSend: function(xhr){
      xhr.setRequestHeader("Authorization","Basic " + btoa("earth" + ":" + "!darpa"));
      xhr.setRequestHeader("Accept","application/json");
      //xhr.setRequestHeader("Content-Type","application/json");
    },
    /*accepts: {
      text: 'application/json'
    },*/
    success:function(data){
      var content = data.children;
      var table= $("#selectionList");
      table.empty();
      for(var i = 0 ; i < content.length; i++){
        var currentChild = content[i];
        var childName = currentChild.pathOrName;
        var nameString = "<li class='selections'>"+childName+"</li>";
        table.append(nameString);

      }
      doneLoading();
    },
    error: function(x, textStatus, errorThrown){
      console.log("Sorry. It appears that there was a problem with querying the server\n error: " + errorThrown);
    }
  });

  $("#popup").show();

});
//http://192.168.1.14:8080/irods-rest/rest/collection/tempZone/home/zach/fda?listing=true
$("#layerButCloud").click(function(){
  layOrGraph = "layer";
  var list = "collection/tempZone/home/zach/layers?listing=true"
  loading();
  $.ajax({
    type:"GET",
    url:(queryroot + list),
    beforeSend: function(xhr){
      xhr.setRequestHeader("Authorization","Basic " + btoa("earth" + ":" + "!darpa"));
      xhr.setRequestHeader("Accept","application/json");
      //xhr.setRequestHeader("Content-Type","application/json");
    },
    /*accepts: {
      text: 'application/json'
    },*/
    success:function(data){
      var content = data.children;
      var table= $("#selectionList");
      table.empty();
      for(var i = 0 ; i < content.length; i++){
        var currentChild = content[i];
        var childName = currentChild.pathOrName;
        var nameString = "<li class='selections'>"+childName+"</li>";
        table.append(nameString);

      }
      doneLoading();
    },
    error: function(x, textStatus, errorThrown){
      console.log("Sorry. It appears that there was a problem with querying the server\n error: " + errorThrown);
    }
  });

  $("#popup").show();
});

$("#popCancel").click(function(){
  $("#popup").hide();
});

//http://192.168.1.14:8080/irods-rest/rest/fileContents/tempZone/home/zach/fda/FILENAME
var layOrGraph;
$("#popLoad").click(function(){
  //QUERY FOR A GRAPH
  if(layOrGraph == "graph"){
    var fileOfInterest = queryroot + "fileContents/tempZone/home/zach/fda/" + fileSelection[0].innerHTML;
    loading();
    $.ajax({
      type:"GET",
      url:(fileOfInterest),
      beforeSend: function(xhr){
        xhr.setRequestHeader("Authorization","Basic " + btoa("earth" + ":" + "!darpa"));
        //xhr.setRequestHeader("Accept","application/json");
        //xhr.setRequestHeader("Content-Type","application/json");
      },
      /*accepts: {
        text: 'application/json'
      },*/
      success:function(data){
        loadTransmissions(data);
        $("#popup").hide();
        doneLoading();
      },
      error: function(x, textStatus, errorThrown){
        console.log("Sorry. It appears that there was a problem with downloading your selected file\n error: " + errorThrown);
      }

    });

  }
  // QUERY FOR A LAYER
  else{
    var fileOfInterest = queryroot + "fileContents/tempZone/home/zach/layers/" + fileSelection[0].innerHTML;
    loading();
    $.ajax({
      type:"GET",
      url:(fileOfInterest),
      beforeSend: function(xhr){
        xhr.setRequestHeader("Authorization","Basic " + btoa("earth" + ":" + "!darpa"));
        //xhr.setRequestHeader("Accept","application/json");
        //xhr.setRequestHeader("Content-Type","application/json");
      },
      /*accepts: {
        text: 'application/json'
      },*/
      success:function(data){
        loadLayer(data);
        $("#popup").hide();
        doneLoading();
      },
      error: function(x, textStatus, errorThrown){
        console.log("Sorry. It appears that there was a problem with downloading your selected file\n error: " + errorThrown);
      }

    });

  }


});


// define what happens when a list item is selected within the popup
var fileSelection;
$("#selectionList").on("click",".selections",function(event){
  var selectedItem = $(event.target);
  if(fileSelection == null){
      fileSelection = selectedItem;
      fileSelection.addClass("selected");
  }else{
    fileSelection.removeClass("selected");
    fileSelection = selectedItem;
    fileSelection.addClass("selected");
  }
});




// Define what is done when the files are loaded
var chooser = $("#infile");
chooser.change(function(evt) {
    console.log($(this).val() + " is loaded");
    // draw file from the input
    var f = this.files[0]

    if(f.type == "application/json"){
      var reader = new FileReader();
      reader.onload = function(data){
        // loadTransmissions is defined in dataloading.js and is intended to
        // load in all of the data provided by a graphviz formatted file.
        // addNewGraph is housed in the earth.js file as it interfaces with the
        // THREE.js visualization.
        loadTransmissionsJson(data.target.result);
      };
    }
    else{
      var reader = new FileReader();
      reader.onload = function(data){
        // loadTransmissions is defined in dataloading.js and is intended to
        // load in all of the data provided by a graphviz formatted file.
        // addNewGraph is housed in the earth.js file as it interfaces with the
        // THREE.js visualization.
        loadTransmissions(data.target.result);
      };
      reader.readAsText(f);
    }
});

// define what is done when a file is selected
var layerSelection = $("#layerFile")
layerSelection.change(function(evt){
  console.log($(this).val() + " is loaded");
  // draw file from the input
  var f = this.files[0]

  if(f){
    var reader = new FileReader();
    reader.onload = function(data){
      // Again addNewLayer is in earth.js to interface appropriately with
      // three.js
      loadLayer(data.target.result);
    };
    reader.readAsText(f);
  }
});

var open = true;

$("#close").click(function(){
  if(open == true){
    var amount = '-' + $("#menu").width().toString() + 'px';
    $("#menu").animate({

      left: amount
    });
    $("#close").animate({
      right:'-25px'
    }).html(">");
    open = false;
  }
  else{
    $("#menu").animate({
      left: '0px'
    });
    $("#close").animate({
      right:'1px'
    }).html("<");
    open = true;
  }

})


function loading(){
  $("body").addClass("loading");
}

function doneLoading(){
  $("body").removeClass("loading");
}



// Make the control panel slide.
