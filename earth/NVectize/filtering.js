
var dataPlaces = {"mandatory":{"name":"","lat":"","lon":""},"optional":{}};
function CSVNewickTree(data){
  //dump the csv onto the screen in a table fileFormat
  csvDump(data[0]);

  // make sure that the remove top row function is defined at this point.
  $("#removeHeader").change(function(){
    csvDump(data[0]);
  });

  // create a function for selecting datasets. three are mandated and others
  // are optional
  chooseName();
}

function chooseName(){

  $("input[type=radio][name]=")
}

function chooseLat(){

}

function chooseLon(){

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
    curSelectable.setAttribute("value",opt);
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
