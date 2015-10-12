var placeNodes


function buildPlaces(places){
  console.log("generating places")
  var keys = Object.keys(places)
  placeNodes = new THREE.Object3D()

  for(var i = 0 ; i < keys.length; i++){
      var currentPlace = places[keys[i]];

      var strCord = currentPlace.position.split(":");



      var lon = parseFloat(strCord[1]) - 90;
      var lat = parseFloat(strCord[0]);

      var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.00//0.01;
      var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.00//0.06;

      var center = new THREE.Vector3();
      center.x = Math.sin(phi) * Math.cos(theta) * rad;
      center.y = Math.cos(phi) * rad;
      center.z = Math.sin(phi) * Math.sin(theta) * rad;

      var geometry = new THREE.SphereGeometry( .5 ,10, 10 );
  		var material = new THREE.MeshLambertMaterial( {color: new THREE.Color(currentPlace.color), ambient: new THREE.Color(currentPlace.color)} );

      var sphere = new THREE.Mesh( geometry, material );
      sphere.position.x = center.x;
      sphere.position.y = center.y;
      sphere.position.z = center.z;

      placeNodes.add(sphere)

  }
  scene.add(placeNodes);

}
