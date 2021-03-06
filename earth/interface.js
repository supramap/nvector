// Data relevant to connecting to our server
//var queryroot = "http://10.16.56.89:8080/irods-rest/rest/";
var userName = "earth";
var psw = "!darpa";
var queryroot = "http://192.168.1.14:8080/irods-rest/rest/"
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
      xhr.setRequestHeader("Authorization","Basic " + btoa(userName + ":" + psw));
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
      alert("Sorry. It appears that there was a problem with querying the server\n Please check your server settings and try again ");
      doneLoading();
      $("#popup").hide();
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
      alert("Sorry. It appears that there was a problem with querying the server\n error: " + errorThrown);
    }
  });

  $("#popup").show();
});

$("#popCancel").click(function(){
  if(isOptions){
    isOptions = false;
    $("#popLoad").html("Load");
    $("#optionsList").hide();
  }
  $("#popup").hide();
});

//http://192.168.1.14:8080/irods-rest/rest/fileContents/tempZone/home/zach/fda/FILENAME
var layOrGraph;
$("#popLoad").click(function(){
  if(isOptions){
    isOptions = false;
    queryroot = "http://" + $("#server").val() + ":8080/irods-rest/rest/";
    userName =  $("#userName").val();
    psw = $("#passwd").val();
    $("#popLoad").html("Load");
    $("#popup").hide();
    $("#optionsList").hide();
    return;
  }
  //QUERY FOR A GRAPH
  if(layOrGraph == "graph"){
    var fileOfInterest = queryroot + "fileContents/tempZone/home/zach/fda/" + fileSelection[0].innerHTML;
    latestFileName = fileSelection[0].innerHTML;
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
          loadTransmissionsJson(JSON.parse(data),latestFileName);
        } catch (e) {
          loadTransmissions(data,latestFileName);
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
    if(!particlesExist && !treeState){
      particlesExist = true;
      testLiveParticle();
    }
    else{
      hideAllParticles();
      particlesExist = false;
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
var latestFileName = "";
chooser.change(function(evt) {
    loading();
    console.log($(this).val() + " is loaded");
    // draw file from the input
    var f = this.files[0]
    latestFileName = f.name;
    if(f.name.indexOf(".json") > -1){
      var reader = new FileReader();
      reader.onload = function(data){
        // loadTransmissions is defined in dataloading.js and is intended to
        // load in all of the data provided by a graphviz formatted file.
        // addNewGraph is housed in the earth.js file as it interfaces with the
        // THREE.js visualization.
        loadTransmissionsJson(data.target.result,latestFileName);
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
        loadTransmissions(data.target.result,latestFileName);
        doneLoading();
      };
      reader.readAsText(f);
    }
    else{
      alert("This application only accepts files of the following extension:\n .json, .gv, .dot");
    }
    $(this).val("");
});

// define what is done when a file is selected
var layerSelection = $("#layerFile")
layerSelection.change(function(evt){
  console.log($(this).val() + " is loaded");
  // draw file from the input
  var f = this.files[0]

  if(f){
    var reader = new FileReader();
    latestFileName = f.name;
    reader.onload = function(data){
      // Again addNewLayer is in earth.js to interface appropriately with
      // three.js
      loadLayer(data.target.result,latestFileName);
    };
    reader.readAsText(f);
  }
});

var open = true;
var isOptions = false;
$("#optionsButton").click(function(){
  $("#popup").show();
  $("#popLoad").html("Connect");
  isOptions = true;
  $("#optionsList").show();
});


$("#viewsTab").click(function(){
  clickViews();
});
$("#dataTab").click(function(){
  clickData();
});
$("#editTab").click(function(){
  clickEdit();
});



function clickViews(){
	 $("#viewsTab").removeClass('inactiveTab');
   $("#dataTab").addClass('inactiveTab');
   $("#editTab").addClass('inactiveTab');

   $("#loadedFiles-names").show();
   $("#nodeDetails").hide();
   $("#editor").hide();


}
function clickData(){
  $("#viewsTab").addClass('inactiveTab');
  $("#dataTab").removeClass('inactiveTab');
  $("#editTab").addClass('inactiveTab');

  $("#loadedFiles-names").hide();
  $("#nodeDetails").show();
  $("#editor").hide();
}
function clickEdit(){

  if(treeState){
    $("#viewsTab").addClass('inactiveTab');
    $("#dataTab").addClass('inactiveTab');
    $("#editTab").removeClass('inactiveTab');

    $("#loadedFiles-names").hide();
    $("#nodeDetails").hide();
    $("#editor").show();
  }
  else{
    if(rootDataStore.length > 0){
      jumpToTree();
      $("#viewsTab").addClass('inactiveTab');
      $("#dataTab").addClass('inactiveTab');
      $("#editTab").removeClass('inactiveTab');

      $("#loadedFiles-names").hide();
      $("#nodeDetails").hide();
      $("#editor").show();
    }
    else{
      alert("A graph needs to be loaded before the editor can be used.");
    }
  }
}

$("#panelButton").click(function(){
  if(open == true){
    var amount = '-' + $("#menu").width().toString() + 'px';
    $("#menu").animate({

      left: amount
    });
    $("#panelButton").animate({
      right:'-30px'
    });
    $("#leftArrow").hide();
    $("#rightArrow").show();
    open = false;
  }
  else{
    $("#menu").animate({
      left: '0px'
    });
    $("#panelButton").animate({
      right:'1px'
    });
    $("#rightArrow").hide();
    $("#leftArrow").show();
    open = true;
  }

})

/*
  The showPossible function is designed to iterate throught the 'possible' array
  containing the names of all the nodes which were intersected.
*/
function showPossible(){
  var outString = "<ul id='possible'>";
  for(var i = 0 ; i < possible.length; i++){
    outString+= "<li class='nodeSel' value='"+possible[i][0]+"' onclick='showSelected(\""+possible[i][0]+"\","+possible[i][1]+")'>"+possible[i][0]+"</li>"
  }
  outString += "</ul>";
  $("#nodeDetails").html(outString);
}

function showSelected(name, rootPosition){
  var info = rootDataStore[rootPosition][0].data[name];
  var infoKeys = Object.keys(info);
  var htmlString = "<table class='descTable'><tr><td class='descriptor'>name</td><td class='value'>"+name+"</td></tr>"
  for(var i = 0; i < infoKeys.length; i++){
    htmlString += "<tr class='descriptorContainer'><td class='descriptor'><span class='tableText'>"+infoKeys[i]+":</span></td><td class='value'><span class='tableText'>"+info[infoKeys[i]]+"</span></td></tr>"
  }
  htmlString += "</table><div class='returnButton' onclick='showPossible()'><input type='image' id='returnArrow' src='images/return.svg'></div>"
  $("#nodeDetails").html(htmlString);
}


function loading(){
  $("body").addClass("loading");
}

function doneLoading(){
  $("body").removeClass("loading");
}


var subToggled = false;
// setup the subtree toggle within the editor
$("#subButton").click(function(){
  if(subToggled){
    subToggled = false;
    $("#subButton").addClass("subButton");
    $("#subButton").removeClass("subButtonTog");
  }
  else{
    subToggled = true;
    $("#subButton").addClass("subButtonTog");
    $("#subButton").removeClass("subButton");

  }
});


// THIS IS FOR THE TIME SLIDER--------------------------------------------------
var dateScroll = false;
var sliderExists = false;
var slider;
function generateSlider(irange){
  sliderExists = true;
  slider = document.getElementById('timeSlide');
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
  var initCount =0
  slider.noUiSlider.on('update', function( values, handle ) {
	   dateValues[handle].innerHTML = formatDate(new Date(+values[handle]));

     if(initCount >= 2){
       if(!dateScroll){
         $("#event-end").show();
         $("#event-start").show();
         dateScroll = true;
       }
     }
     else{
       initCount++;
     }

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

  // This enables updating of the graph on change in the handle
  /*$(".noUi-handle")
  .mousedown(function(){
    $("#event-end").show();
    $("#event-start").show();
    dateScroll = true;
  });*/



  slider.noUiSlider.on('set',function(){
    $("#event-end").hide(300);
    $("#event-start").hide(300);
    dateScroll = false;
    // Update the graph to display the different time range
    var slideEnds = slider.noUiSlider.get();
    redrawGraph(reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
  });
  // This enables updating of the graph on change in the bar

  /*$("body").mouseup(function(){
    if(dateScroll){
      $("#event-end").hide(300);
      $("#event-start").hide(300);
      dateScroll = false;
      // Update the graph to display the different time range
      var slideEnds = slider.noUiSlider.get();
      redrawGraph(reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
    }
  });*/

}



function checkSlider(){
  var usableRange = [];
  for(var i = 0; i < rootDataStore.length; i++){
    var timeFlag = rootDataStore[i][0].options.time;


    var minDate = rootDataStore[i][0].options.timeRange[0];
    var maxDate = rootDataStore[i][0].options.timeRange[1]

    if(usableRange.length > 0 && timeFlag == true){
      // check the new mindate relative to the old mindate
      if(new Date(minDate) < new Date(usableRange[0]) ){
        usableRange[0] = minDate;
      }
      // check the new maxdate relative tot he old maxdate
      if( new Date(usableRange[1]) < new Date(maxDate)){
        usableRange[1] = maxDate;
      }

    }
    // If this is the first or only time based file currently loaded then
    // stuff it in there.
    else if(timeFlag == true){
      usableRange[0] = minDate;
      usableRange[1] = maxDate;
    }


  }

  if(usableRange.length > 0){
    /*slider.noUiSlider.updateOptions({
      start:[timestamp(usableRange[0]),timestamp(usableRange[1])],
      step: 7*24*60*60*1000,
      margin:20,
      connect: true,
      direction: 'rtl',
      orientation: 'vertical',
      behaviour: 'tap-drag',
      range:{
        'min': timestamp(usableRange[1]),
        'max': timestamp(usableRange[0])
      }
    });*/
    slider.noUiSlider.destroy();
    generateSlider(usableRange);
  }
  else{
    if(sliderExists){
      slider.noUiSlider.destroy();
    }
  }
}





// THIS IS FOR THE TIME SLIDER--------------------------------------------------



// THIS IS FOR THE TREE VIEW----------------------------------------------------
  $("#treeToggle").click(function(){
    jumpToTree();
  });

// THIS IS FOR THE TREE VIEW----------------------------------------------------



// Make the control panel slide.
