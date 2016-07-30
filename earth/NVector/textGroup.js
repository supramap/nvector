

/*
  This is the constructor for creating the text group
*/
function textGroup(font, color, size){
  var size = size;
  var font = font;
  var color = color;
  list = [];
  vectors = [];
  var geo;
  var rendPos;

  /*
    The addString function takes in the string that you would like to add as well as the
    THREE.Vector3 for the place that you would like to add it. The add function simpleGeometry
    needs to add the inputs into the correct arrays prior to building the mesh.
  */
  this.addString = function(string, vector){
    list.push(string);
    vectors.push(vector);
  }


  this.build = function(){
    var texture = buildTexture();
    var geometry = buildGeo();
    var mat = new THREE.MeshBasicMaterial({map:texture});
    return new THREE.Mesh(geometry, mat);
  }

  /*
    The buildGeo function iterates through the lists of strings and coordinates
    to generate a single geometry that can be used to create the text mesh.
  */
  function buildGeo(){
    geo = new THREE.Geometry();
    rendPos = 0;
    // iterate over all of the strings in the list
    for(var i = 0; i < list.length; i++){
        var currentString = list[i];
        var currentPlace = vectors[i];
        // iterate over the string
        for(var char = 0; char < currentString.length; char++){
          var cc = currentString.charCodeAt(char);
          characterGeo(cc,currentPlace, char);
        }
    }
    return geo;
  }

  /*
    chracterGeo plots the geometry for and individual character. Its input
    includes a character code, a THREE.Vector3 for the string's location, and
    and integer for the locations of the character within the string.
  */
  function characterGeo(charCode, location, inString){
    var lettersPerSide = 16;
    var code = charCode;
    var cx = code % lettersPerSide; // Cx is the x-index of the letter in the map.
    var cy = Math.floor(code / lettersPerSide); // Cy is the y-index of the letter in the map.
    var tx = cx/lettersPerSide - .001,
        ty = cy/lettersPerSide

    // create a vairable that accounts for where the current character is within
    // the string itself so as to make a whole word.
    var cSpacing = inString * size;

    geo.vertices.push(
      new THREE.Vector3( location.x + cSpacing, location.y, 0 ),
      new THREE.Vector3( location.x + size + cSpacing, location.y, 0 ),
      new THREE.Vector3( location.x + size + cSpacing, location.y + size, 0 ),
      new THREE.Vector3( location.x + cSpacing, location.y + size, 0 )
    );

    var facePlace = rendPos * 4;
    var face = new THREE.Face3( facePlace + 0,facePlace + 1,facePlace + 2 );
    geo.faces.push(face);
    face = new THREE.Face3(facePlace + 0,facePlace + 2,facePlace + 3);
    geo.faces.push(face);

    rendPos++;

    // Now to map the faces we just created with the correct character as drawn
    // in the canvas texture.

    off = 1/lettersPerSide - .015;
    geo.faceVertexUvs[0].push([
      new THREE.Vector2( tx, ty+off ),
      new THREE.Vector2( tx+off, ty+off ),
      new THREE.Vector2( tx+off, ty )
    ]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2( tx, ty+off ),
      new THREE.Vector2( tx+off, ty ),
      new THREE.Vector2( tx, ty )
    ]);


  }

  function buildTexture(){
    var fontSize = 100

    // The square letter texture will have 16 * 16 = 256 letters, enough for all 8-bit characters.
    var lettersPerSide = 16;


    var c = document.createElement('canvas');
    c.width = c.height = fontSize*lettersPerSide;
    var ctx = c.getContext('2d');
    ctx.font = fontSize+'px Arial';
    ctx.fillStyle = "rgba(255,255,255,0.95)"

    // for the sake of testing
    /*c.style.position = 'absolute';
    c.style.top = '0';
    c.style.left= '0';
    c.style.border='thick solid blue';
    */
    // This is a magic number for aligning the letters on rows. YMMV.
    var yOffset = -0.25;

    // Draw all the letters to the canvas.
    for (var i=0,y=0; y<lettersPerSide; y++) {
      for (var x=0; x<lettersPerSide; x++,i++) {
        var ch = String.fromCharCode(i);
        ctx.fillText(ch, x*fontSize, yOffset*fontSize+(y+1)*fontSize);
      }
    }


    // Create a texture from the letter canvas.
    var tex = new THREE.Texture(c);
    // Tell Three.js not to flip the texture.
    tex.flipY = false;
    // And tell Three.js that it needs to update the texture.
    tex.needsUpdate = true;
    //document.body.appendChild(c);
    return tex;
  }
}
