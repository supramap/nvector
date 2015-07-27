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
