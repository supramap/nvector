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
        // test if the selected file is json. Otherwise assume that it is gv
        try {
          loadTransmissionsJson(JSON.parse(data));
        } catch (e) {
          loadTransmissions(data);
        }
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


// particle cloud toggle button

$("#particleToggle").click(function(){
  if(particleCloud != undefined && graph != undefined){
    if(!particlesExist){
      graph.add(particleCloud);
      particlesExist = true;
    }
    else{
      graph.remove(particleCloud)
      particlesExist = false;
    }
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
    loading();
    console.log($(this).val() + " is loaded");
    // draw file from the input
    var f = this.files[0]

    if(f.name.indexOf(".json") > -1){
      var reader = new FileReader();
      reader.onload = function(data){
        // loadTransmissions is defined in dataloading.js and is intended to
        // load in all of the data provided by a graphviz formatted file.
        // addNewGraph is housed in the earth.js file as it interfaces with the
        // THREE.js visualization.
        loadTransmissionsJson(data.target.result);
        doneLoading();
      };
      reader.onerror= function(err){
          console.log(err);
      };
      reader.readAsText(f);
    }
    else if(f.name.indexOf(".gv") > -1 || f.name.indexOf(".dot") > -1){
      var reader = new FileReader();
      reader.onload = function(data){
        // loadTransmissions is defined in dataloading.js and is intended to
        // load in all of the data provided by a graphviz formatted file.
        // addNewGraph is housed in the earth.js file as it interfaces with the
        // THREE.js visualization.
        loadTransmissions(data.target.result);
        doneLoading();
      };
      reader.readAsText(f);
    }
    else{
      alert("This application only accepts files of the following extension:\n .json, .gv, .dot");
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
      right:'-30px'
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


// THIS IS FOR THE TIME SLIDER--------------------------------------------------
var dateScroll = false;
var sliderExists = false;
function generateSlider(irange){
  sliderExists = true;
  var slider = document.getElementById('timeSlide');
  noUiSlider.create(slider,{
    start:[timestamp(irange[0]),timestamp(irange[1])],
    step: 7*24*60*60*1000,
    margin:20,
    connect: true,
    direction: 'rtl',
    orientation: 'vertical',
    behaviour: 'tap-drag',
    range:{
      'min': timestamp(irange[0]),
      'max': timestamp(irange[1])
    }
    /*format: wNumb({
      decimals:0
    })*/
    /*pips:{
      mode:'steps',
      density: 2
    }*/
  });

  var dateValues = [
	   document.getElementById('event-start'),
     document.getElementById('event-end')
  ];

  slider.noUiSlider.on('update', function( values, handle ) {
	   dateValues[handle].innerHTML = formatDate(new Date(+values[handle]));
     $("#event-start").css({
       top: function(){
         return $(".noUi-handle-lower").offset().top + 5;
       }
     });

     $("#event-end").css({
       top: function(){
         return $(".noUi-handle-upper").offset().top + 5;
       }
     });
  });

  $("#event-end").hide();
  $("#event-start").hide();

  $(".noUi-handle")
  .mousedown(function(){
    $("#event-end").show();
    $("#event-start").show();
    dateScroll = true;
  });
  $("body").mouseup(function(){
    if(dateScroll){
      $("#event-end").hide(300);
      $("#event-start").hide(300);
      dateScroll = false;
      // Update the graph to display the different time range
      var slideEnds = slider.noUiSlider.get();
      redrawGraph(reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
    }
  });

}
// THIS IS FOR THE TIME SLIDER--------------------------------------------------



// THIS IS FOR THE TREE VIEW----------------------------------------------------
  $("#treeToggle").click(function(){
    jumpToTree();
  });

// THIS IS FOR THE TREE VIEW----------------------------------------------------



// Make the control panel slide.
