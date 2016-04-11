
var dataPlaces = {"mandatory":{"name":"","lat":"","lon":""},"optional":{}};
function CSVNewickTree(data){
  $("#finishFilter").hide();

  $("#finishFilter").click(function(){
    var topRow = $("#removeHeader").prop("checked");
    createTreeCSVNewick(data,dataPlaces,topRow);
  });

  //dump the csv onto the screen in a table fileFormat
  csvDump(data[0]);
  $("#custom").hide();
  // make sure that the remove top row function is defined at this point.
  $("#removeHeader").change(function(){
    csvDump(data[0]);
  });

  // create a function for selecting datasets. three are mandated and others
  // are optional
  chooseName();
}

function chooseName(){
  manipGraph("name","mandatory",chooseLat);
}

function chooseLat(){
  $("#cursearch").html("Latitudes");
  manipGraph("lat","mandatory",chooseLon);
}

function chooseLon(){
  $("#cursearch").html("Longitudes");
  manipGraph("lon","mandatory",chooseCustom);
}

function chooseCustom(){
  $("#custom").show();
  $("#instruction").html("Enter any additional options below");
  manipGraph("NONE","optional",chooseCustom);
}

function manipGraph(namePlace,importance,nextProcess){
  $("input[type=radio][name=columnChoice]").unbind().change(function(){
    if(namePlace == "NONE"){
      // assume then that we are entering custom values and need to draw form
      // the textbox.
      var customName = $("#custom").val();
      $("#custom").val('');

      dataPlaces[importance][customName] = this.value;
    }
    else{
      dataPlaces[importance][namePlace] = this.value;
    }
    $("#dataFilter td:nth-child("+this.value+")").css("opacity",".6");
    $("#dataFilter td:nth-child("+this.value+")").css("background-color","darkgray");
    $("input[type=radio]:nth("+(parseInt(this.value) - 1)+")").attr("disabled",true);

    if(namePlace == "lon"){
      $("#finishFilter").show();
    }
    nextProcess();
  });
}



function csvDump(inString){
  // split the csv by line wraps to begine iterating through the coloumns
  var parsedCsv = inString.split('\n');

  // make sure that the vetical length of the table is never greater than 10
  // so that the user doesnt need to go nuts with premature data overload
  var tableLength = 0;
  if(parsedCsv.length < 10){
    tableLength = parsedCsv.length;
  }
  else{
    tableLength = 10;
  }

  // destroy
  $("#dataFilter").empty();
  // build up the row of selectable boxes to allow for choosing elements
  var totWidth = parsedCsv[0].split(",").length;
  var selectRow = document.createElement("tr");
  for(var opt = 0; opt < totWidth; opt++){
    var curOption = document.createElement("td");
    var curSelectable = document.createElement("input");
    curSelectable.setAttribute("type","radio");
    curSelectable.setAttribute("name", "columnChoice");
    curSelectable.setAttribute("value",opt + 1);
    curOption.appendChild(curSelectable);
    selectRow.appendChild(curOption);
  }
  $("#dataFilter").append(selectRow);

  for(var col = 0; col < tableLength; col++){
    if($("#removeHeader").is(':checked') && col == 0){
      continue;
    }
    var rowData = document.createElement("tr");

    // now iterate throught all of the rows values
    var cRow = parsedCsv[col].split(",");
    for(var row = 0; row < cRow.length; row++){
      var curData = document.createElement("td");
      curData.innerHTML = cRow[row];
      rowData.appendChild(curData);
    }
    $("#dataFilter").append(rowData);
  }
}
