
function loadLayer(data){
	var	inObject = JSON.parse( data );
	addNewLayer(inObject);
}

function loadTransmissionsJson(data,dataName){
	if(typeof data == "string"){
		locations = JSON.parse( data );
	}
	else{
		locations = data;
	}

	// calculate the time range if not presant.
	if(locations.options.time == true && locations.options.timeRange.length < 2){
		var coreData = locations.data;
		var objKeys = Object.keys(coreData);
		var minDate;
		var maxDate;
		for(var i = 0; i < objKeys.length; i++){
			var currentObj = coreData[objKeys[i]]

			if(currentObj.date.length < 1){
				continue;
			}

			if(minDate == undefined){
				minDate = currentObj.date
			}
			if(maxDate == undefined){
				maxDate = currentObj.date
			}

			if(new Date(currentObj.date) < new Date(minDate)){
				minDate = currentObj.date;
			}
			if(new Date(currentObj.date) > new Date(maxDate)){
				maxDate = currentObj.date;
			}
		}

		locations["options"].timeRange = [minDate,maxDate];
	}


	if(!jQuery.isEmptyObject(locations)){
		if(locations.metadata.fileName.length < 1){
			addNewGraph(locations,dataName)
		}
		else{
			addNewGraph(locations,locations.metadata.fileName);
		}

	}
	// Need to check for the presence of a root. If not present with a graph like
	// structure then it needs to be added.
}

function loadTransmissions(data,dataName){
	// locations is used for the transmission of data between two points,
	locations = {};
	locations['metadata']={"author":"","description":"","filename":"","irods":""};
	locations['options']={"roots":[],"rootsCount":0, "time":false};
	locations['data'] = {};
	// places is used for individula points being added
	places = {}
	var lines = data.split("\n");
	for (var on=0; on < lines.length; on++){
		var line = lines[on];

		if(line.indexOf("->") > -1){
	    // split the line up into relevant chunks of data
	    var relevant = line.split("->");

	    // narrow down the start position
	    var start = relevant[0].replace(/\"/g,"").trim();

	    // narrow down the end position
	    var end = relevant[1].substring(0,relevant[1].indexOf("[")).replace(/\"/g,"").trim();

	    // gather options and positions.
	    var options = {};
	    var rawOptions = relevant[1].substring(relevant[1].indexOf("[") + 1,relevant[1].indexOf("]")).split(",");
	    for (var i = 0; i < rawOptions.length; i++){

	      var currentOption = rawOptions[i];
	      var splitOption = currentOption.split("=")
	      //console.log(splitOption);
	      options[splitOption[0].trim()] = splitOption[1].replace(/\"/g,"");
	    }
	    // with options gathered I can start building the appropriate object for
	    // properly building the tree.
	    // Start, End, and Options are relevant variables to check Locations is target.

	    //Check if variable is in locations

	    if (!(start in locations.data)){
	        // if not then add it and initiate with end position
					var manipCoord = options.start.split(":");
					if(manipCoord == "NONE"){
						locations.data[start] = {"children":[end], "root":"true", "coord":"NONE"}
					}
					else{
						var arrCoord = [parseInt(manipCoord[0]), parseInt(manipCoord[1])];
	        	locations.data[start] = {"children":[end], "root":"true", "coord":arrCoord}
					}
	    }
	    else{
	        // if it is in there then we need to append this end to it's children

	        var past = locations.data[start];
	        var siblings = past.children;
	        siblings.push(end);
	        past.children = siblings;
	    }
	    // if the end point is not listed then it too needs to be added
	    if (!(end in locations.data)){
					var manipCoord = options.end.split(":");
					if(manipCoord == "NONE"){
						locations.data[end] = {"children":[], "root":"false", "coord":"NONE"}
					}
					else{
						var arrCoord = [parseInt(manipCoord[0]), parseInt(manipCoord[1])];
	        	locations.data[end] = {"children":[], "root":"false", "coord":arrCoord};
					}
	    }
	    else if( (end in locations.data) && locations.data[end].root == "true"){
	    		locations.data[end].root = false;
	    }

	  }
		else if(line.indexOf("\"") > -1){
			// assuming that it is just a single point.
			var relevant = line.split("[");
			var nodeName = relevant[0].replace(/\"/g,"").trim();
			var options = relevant[1].replace(/]/g,"").split(",");
			places[nodeName] = {}
			for(var i = 0; i < options.length; i++){
				currentOption = options[i].split("=");
				if (currentOption[0].trim() == "position"){
					places[nodeName].position = currentOption[1].replace(/\"/g,"").trim();
				}
				if (currentOption[0].trim() == "color"){
					places[nodeName].color = currentOption[1].replace(/\"/g,"").trim();
				}
			}

		}

	}// end of the big for loop

	var realroots = [];

	var keys = Object.keys(locations.data);
  // iterate through all of the existing keys and check for their root values
  for(var i = 0; i < keys.length; i++){
      // if its a root then add it to my list of roots for future reference.
      var current = locations.data[keys[i]];
      if (current.root == "true"){
        realroots.push(keys[i]);
      }
  }


	if(!jQuery.isEmptyObject(places)){
		buildPlaces(places);
	}

	locations.options["roots"] = realroots;
	if(!jQuery.isEmptyObject(locations)){
		addNewGraph(locations,dataName);
	}

	//callback(locations);
}



function loadContentData(callback){
	var filePath = "categories/All.json";
	filePath = encodeURI( filePath );
	// console.log(filePath);

	xhr = new XMLHttpRequest();
	xhr.open( 'GET', filePath, true );
	xhr.onreadystatechange = function() {
		if ( xhr.readyState === 4 && xhr.status === 200 ) {
	    	timeBins = JSON.parse( xhr.responseText ).timeBins;

			maxValue = 0;
			// console.log(timeBins);

			startTime = timeBins[0].t;
	    	endTime = timeBins[timeBins.length-1].t;
	    	timeLength = endTime - startTime;

			if(callback)
				callback();
	    	console.log("finished read data file");
	    }
	};
	xhr.send( null );
}
