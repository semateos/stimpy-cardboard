


//Three.js rendering:
var camera, scene, renderer;
var effect, controls;
var element, container;
var cube, time;

var particleSystem, particles,
particleSystemHeight = 500,
particleCount = 2000;

var clock = new THREE.Clock();

var socket = io();

init();
animate();

function socketSend(message){

  socket.emit('message', message);

}

var camera_y, camera_x;

function handleKey(keyevent){

  //console.log(keyevent);

  if(keyevent.event == 'keydown'){

    switch(keyevent.key){

      case 87: //w key

        //console.log('forward');
        camera_y = camera.position.y - 50;
        break;

      case 83: //s key

        //console.log('back');
        camera_y = camera.position.y + 50;
        break;

      case 65: //a key

        //console.log('left');
        camera_x = camera.position.x - 50;
        break;

      case 68: //d key

        //console.log('right');
        camera_x = camera.position.x + 50;
        break;
    }
  }
}

socket.on('message', function(keyevent){

  handleKey(keyevent);

});


window.onkeydown = function(e) {
  
   var key = e.keyCode ? e.keyCode : e.which;

   var keyevent = {'event': 'keydown', 'key': key};

   handleKey(keyevent);
   socketSend(keyevent);
}

/*
window.onkeyup = function(e) {
  
   var key = e.keyCode ? e.keyCode : e.which;

   var keyevent = {'event': 'keyup', 'key': key};

   handleKey(keyevent);
   socketSend(keyevent);
}
*/

function init() {
  
  //set up camera stuff:
  var errorCallback = function(e) {
    console.log('Reeeejected!', e);
  };

  navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

  function gotSources(sourceInfos) {

    console.log(sourceInfos);

    var sourceId;

    //the back facing camera on nexus 5 is the 4th source:
    if(sourceInfos[4]){

      sourceId = sourceInfos[4].id;
    }

    //set the constraints for this preference
    var constraints = {
      audio: false,
      video: {
        optional: [{sourceId: sourceId}]
      }
    }

    //video containers for left and right eye
    var video1 = document.querySelector('video.left');
    var video2 = document.querySelector('video.right');

    //set the video source for both eyes to the same video stream:
    if (navigator.getUserMedia) {
      navigator.getUserMedia(constraints, function(stream) {
        video1.src = window.URL.createObjectURL(stream);
        video2.src = window.URL.createObjectURL(stream);
      }, errorCallback);
    }
  }

  if (typeof MediaStreamTrack === 'undefined'){
    alert('This browser does not support MediaStreamTrack.');
  } else {
    MediaStreamTrack.getSources(gotSources);
  }

  // make the three.js background transparent:
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor( 0x000000, 0 );

  // create the three container:
  element = renderer.domElement;
  container = document.getElementById('example');
  container.appendChild(element);

  //stereo render effect:
  effect = new THREE.StereoEffect(renderer);
  scene = new THREE.Scene();

  //set up the camera:
  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
  camera.position.set(0, 10, 100);
  scene.add(camera);

  camera_y = camera.position.y;
  camera_x = camera.position.x;

  controls = new THREE.OrbitControls(camera, element);
  controls.rotateUp(Math.PI / 4);
  controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
  );
  controls.noZoom = true;
  controls.noPan = true;

  //if mobile device, user device orientation controls:
  if(window.DeviceOrientationEvent){

    //console.log('orientation');

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();
    
    //element.addEventListener('click', fullscreen, false);
  }

  var full_button = document.getElementById('fullscreen');
  full_button.addEventListener('click', fullscreen, false);
  

  //add light to the scene (this is red light)
  var light = new THREE.HemisphereLight(0xff0000, 0x000000, 1);
  scene.add(light);

  //add an object to the scene
  cube = new THREE.Mesh( new THREE.DodecahedronGeometry( 100 ), new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true } ));
  cube.position.x = 300;
  cube.position.y = 70;
  cube.position.z = 50;
  scene.add( cube );


  // create the particle variables
  particles = new THREE.Geometry();

  pMaterial = new THREE.PointCloudMaterial({
    color: 0xFF0000,
    size: 3,
    
    fog: true, 
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  // now create the individual particles
  for (var p = 0; p < particleCount; p++) {

    // create a particle with random
    // position values, -250 -> 250
    var pX = Math.random() * particleSystemHeight * 2 - particleSystemHeight,
        pY = Math.random() * particleSystemHeight * 2 - particleSystemHeight,
        pZ = Math.random() * particleSystemHeight * 2 - particleSystemHeight,
        particle = new THREE.Vector3(pX, pY, pZ);

        particle.velocity = new THREE.Vector3(
          0,              // x
          -Math.random() / 3, // y: random vel
          0);             // z

    // add it to the geometry
    particles.vertices.push(particle);
  }

  // create the particle system
  particleSystem = new THREE.PointCloud(
      particles,
      pMaterial);

  particleSystem.sortParticles = true;

  // add it to the scene
  scene.add(particleSystem);

  //var text = new THREE.Mesh( new THREE.TextGeometry("Testing", {size: 20, height: 30}), new THREE.MeshNormalMaterial() );
  //scene.add( text );


  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update(dt) {
  resize();

  camera.updateProjectionMatrix();

  controls.update(dt);
}

function render(dt) {

  time = clock.getElapsedTime();

  cube.rotation.x += 0.02;
  cube.rotation.y += 0.02;
  cube.rotation.z += 0.02;
  cube.position.y  = 100 + 20 * Math.sin(time * 3);

  //particleSystem.rotation.y += 0.01;

  //update camera
  camera.position.y = camera_y;
  camera.position.x = camera_x;
  camera.updateProjectionMatrix();

  var pCount = particleCount;
  while (pCount--) {

    // get the particle
    var particle =
      particles.vertices[pCount];

    // check if we need to reset
    if (particle.y < -1 * particleSystemHeight ) {
      particle.y = particleSystemHeight;
      particle.velocity.y = 0;
    }

    // update the velocity with
    // a splat of randomniz
    particle.velocity.y -= Math.random() * .05;

    // and the position
    particle.add(particle.velocity);
  }

  // flag to the particle system
  // that we've changed its vertices.
  particleSystem.
    geometry.
    __dirtyVertices = true;
  

  effect.render(scene, camera);
}

function animate(t) {
  requestAnimationFrame(animate);

  var dt = clock.getDelta();

  update(dt);
  render(dt);
}

function fullscreen() {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen();
  } else if (document.body.msRequestFullscreen) {
    document.body.msRequestFullscreen();
  } else if (document.body.mozRequestFullScreen) {
    document.body.mozRequestFullScreen();
  } else if (document.body.webkitRequestFullscreen) {
    document.body.webkitRequestFullscreen();
  }
}