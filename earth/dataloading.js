function loadWorldPins( callback ){
	// We're going to ask a file for the JSON data.
	xhr = new XMLHttpRequest();

	// Where do we get the data?
	xhr.open( 'GET', latlonFile, true );

	// What do we do when we have it?
	xhr.onreadystatechange = function() {
	  // If we've received the data
	  if ( xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0 )) {
	      // Parse the JSON
	      latlonData = JSON.parse( xhr.responseText );
	      if( callback )
	      	callback();
	    }
	};

	// Begin request
	xhr.send( null );
}

function loadStatePins(callback){
	// We're going to ask a file for the JSON data.
	xhr = new XMLHttpRequest();

	// Where do we get the data?
	xhr.open( 'GET', "states.json", true );

	// What do we do when we have it?
	xhr.onreadystatechange = function() {
	  // If we've received the data
	  if ( xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0 )) {
	      // Parse the JSON
	      stateCoords = JSON.parse( xhr.responseText );
	      if( callback )
	      	callback();
	    }
	};

	// Begin request
	xhr.send( null );
}


function loadGVFile(data,callback){
	//I'm assuming the file will come in as one monsterous string, so split on
	//line seperation
	var connections = {}
	var lines = data.split("\n");
	//begin line analysis as started in the nodejs file
	for (var i = 0; i < lines.length; i++){
		var current = lines[i];
		if (current.indexOf("->") > -1){
		  var sides = current.split("->");
		  var origin = sides[0];
		  var destLabel = sides[1].split("[");
		  var dest = destLabel[0];
		  var label = destLabel[1].replace(" label = \"","").replace("\" ]", "");
		  //console.log(origin + " : " + dest);
			origin = origin.trim().replace("_", " ");
			dest = dest.trim().replace("_", " ");
			connections[origin] = dest
	  }
		//console.log(current);
	}
	callback(connections);
}

function loadTransmissions(data, callback){
	locations = {};
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

	    if (!(start in locations)){
	        // if not then add it and initiate with end position

	        locations[start] = {"children":[end], "root":"true", "coord":options.start}

	    }
	    else{
	        // if it is in there then we need to append this end to it's children

	        var past = locations[start];
	        var siblings = past.children;
	        siblings.push(end);
	        past.children = siblings;
	    }
	    // if the end point is not listed then it too needs to be added
	    if (!(end in locations)){
	        locations[end] = {"children":[], "root":"false", "coord":options.end};
	    }
	    else if( (end in locations) && locations[end].root == "true"){
	      locations[end].root = false;
	    }

	  }

	}// end of the big for loop

	var realroots = [];

	var keys = Object.keys(locations);
  // iterate through all of the existing keys and check for their root values
  for(var i = 0; i < keys.length; i++){
      // if its a root then add it to my list of roots for future reference.
      var current = locations[keys[i]];
      if (current.root == "true"){
        realroots.push(keys[i]);
      }
  }


	locations["TreeRoots"] = realroots;
	callback(locations);
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

function loadCountryCodes( callback ){
	cxhr = new XMLHttpRequest();
	cxhr.open( 'GET', isoFile, true );
	cxhr.onreadystatechange = function() {
		if ( cxhr.readyState === 4 && (cxhr.status === 200 || cxhr.status === 0) ) {
	    	countryLookup = JSON.parse( cxhr.responseText );
	    	console.log("loaded country codes");
	    	callback();
	    }
	};
	cxhr.send( null );
}
