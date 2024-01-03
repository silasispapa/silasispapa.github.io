// Original code by: The Coding Train / Daniel Shiffman
// https://youtu.be/FYgYyq-xqAw
// Modified and improved by Justin Yong Ji Yii for application:
// Sitting Pose Estimation using PoseNet and Classification Model

let cnv;
let video;
let poseNet;
let pose;
let skeleton;
let programstatus = 0; //0 = not running, 1 = running
let stopbtn_call = false;
let slider;
let volumebarstatus = 0; //0 = not showing, 1 = showing

let classification_model;
let poseLabel = "Starting";
let posecounter;
let maxposescore = 300;
var accuracyscore = 0.0;

let w = 640;
let h = 480;
let volumeH;

let cameraarea;
let volumearea;

function setup() {
  //creating canvas and drawing panel
  cnv = createCanvas(w, h);
  cameraarea = createGraphics(w, h);
  volumearea = createGraphics(w, 40);

  // Create and move the slider to the bottom right of the canvas
  slider = createSlider(0, 100, 80, 10);
  slider.style('width', '100px');
  slider.position(cnv.position().x+480,cnv.position().y+h-48-10);
  slider.hide();
  slider.addClass("sliderbar");

  // connect to a div class for styling
  cnv.parent('canvasarea');
  slider.parent('volumecanvas');

  //resize canvas according to window size
  windowSizeCheck();
  drawcameraarea();
  frameRate(30);
}

function StartProgram() {
  const startBtn = document.getElementById('srtbtn');
  const stopBtn = document.getElementById('endbtn');

  if (programstatus==0) {
    //hide the manual modal if opened
    const manualModal = document.getElementById('manualModal');
    if (manualModal.style.display === 'block') {manualModal.style.display = 'none';}
    document.body.classList.remove('guide-modal-open');
    document.body.style.backdropFilter = '';

    clear();
    select('#progstatus').html('Program starting...');
    select('#error-code').html("Loading...");

    // loading video/camera source
    video = createCapture(VIDEO);
    video.hide();

    // initialize the variable
    programstatus = 1;
    posecounter = maxposescore / 2;

    // loading posenet model and pass video source for estimation

    let posenetoptions = {
      imageScaleFactor: 0.45,
      outputStride: 16,
      maxPoseDetections: 1,
      minConfidence: 0.3,
      scoreThreshold: 0.5,
      inputResolution: 513,
    };

    poseNet = ml5.poseNet(video, posenetoptions, posenet_Loaded);
    poseNet.on('pose', gotPoses);

    // declaring the classification model options
    let options = {
      inputs: 34,
      outputs: 2,
      task: 'classification',
    };

    //clssiification model loading
    classification_model = ml5.neuralNetwork(options);
    const modelInfo = {
      model: 'model/model.json',
      metadata: 'model/model_meta.json',
      weights: 'model/model.weights.bin',
    };

    classification_model.load(modelInfo, classification_modelLoaded);

    // Hide start button and show stop button
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';

    //loop = start draw() function
    loop();
    
    // use a delay to check if the video is loaded
    setTimeout(() => {
      if(!(video.loadedmetadata))
      {
        select('#error-code').html("Cannot access/load camera. Please check your camera access permission.");
      }else{
        changeErrorCode("green");
      }
    }, 10000);
  }
}

function classification_modelLoaded() {
  console.log('pose classification ready!');
  select('#camaccess').html('Please sit well for your health.');
  select('#progstatus').html('Program running.')
  classifyPose(); //calling classify function
}

function posenet_Loaded() {
  console.log('poseNet ready');
}

function gotPoses(poses) {
  if(programstatus==1){
    if (poses.length > 0) { //if detect pose, store to global variable
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
    }
  }
}

function classifyPose() {
  if(programstatus==1){
    if (pose) 
    { //if detect pose/not empty
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) 
      {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y); //flatten the array
      }
      classification_model.classify(inputs, gotResult); //passing to classification model
    } 
    else 
    {
      setTimeout(classifyPose, 3000); 
      //if cannot detect pose, detect again after some time
    }
  }
}

function gotResult(error, results) {

  accuracyscore = results[0].confidence;
  if (accuracyscore > 0.6) { //accuracy score threshold
    poseLabel = results[0].label.toUpperCase(); //extract the label
    
    if(poseLabel=="G"){
      poseLabel = "Good";
    }else if(poseLabel=="B"){
      poseLabel = "Bad";
    }
    SPCounter();
  } else {
    poseLabel = "Undefined";  //if the accuracy too low, set unknown
  }

  classifyPose(); //calling classifypose for looping
}

//sitting posture score counter
function SPCounter(){
  
  //add or subtract counter according to label
  if(poseLabel=="Good")
  {
    if(posecounter<maxposescore){
      posecounter +=1;
    }
  } 
  else if (poseLabel=="Bad")
  {  
    if(posecounter>0){
      posecounter -=1;  
    }
  }
  if(posecounter<=0){
    // alert user when pose score is 0
    posecounter = maxposescore;
    playsound();
    //change the text to green red
    changeErrorCode("red");
    
    setTimeout(() => {
      changeErrorCode("green");
    }, 5000);
  }
}

function changeErrorCode(color){
  if (color == "red"){
    //change the text to red
    select('#error-code').style('color', '#bf616a');
    select('#error-code').html("Recorrect sitting");
  }
  else if (color == "green"){
    //change the text to green
    select('#error-code').style('color', '#a3be8c');
    select('#error-code').html("Sit well, do well.");
  }
}

function drawvolumearea(){
  volumearea.background('#434c5e');
  volumearea.fill('#e5e9f0');
  volumearea.textSize(20);
  volumearea.text(String(slider.value()),600,25);
  image(volumearea, 0, 480-40);
}

function drawcameraarea(){
  cameraarea.background(51);
  image(cameraarea,0,0);
}

// continuous running code section
function draw() {
  // scale the canvas according to window size
  scale(w/640);

  //catching slider value and slider appearance in real time
  setalertvolume(slider.value());

  // catch canvas click event to show volume bar
  cnv.mouseClicked(() => {
    if(volumebarstatus==0){
      if(programstatus==0) drawcameraarea();
      volumebarstatus = 1;
      slider.show(); 
    }
    else if(volumebarstatus==1){
      slider.hide();
      volumebarstatus = 0;
      if(programstatus==0) drawcameraarea();
    }
  });

  // program started
  if(programstatus==1){
    push();
    translate(video.width, 0);
    scale(-1, 1);
    clear();
    image(video, 0, 0, video.width,video.height); //640 480
    if (pose) {
      // detecting the body parts
      for (let i = 0; i < skeleton.length; i++) {
        let a = skeleton[i][0];
        let b = skeleton[i][1];
        strokeWeight(2);
        stroke('#d08770');

        //connecting the dots
        line(a.position.x, a.position.y, b.position.x, b.position.y);
      }
      // drawing the dots
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill('#2e3440');
        stroke('#e5e9f0');
        ellipse(x, y, 16, 16);
      }
    }
    pop(); //end of reverse scale

    //text appearance
    fill(255, 0, 255);
    stroke('#3b4252');
    textSize(30);
    
    //pose score
    text(poseLabel,20,40);
    text(accuracyscore.toFixed(4),20,80);
    
    //pose score bar 
    stroke('#2e3440');
    // pose bar bacground
    fill('gray');
    rect(20,100,100,20);
    
    // pose bar color change according to pose score
    if(posecounter>=maxposescore/2){
      fill('#a3be8c')
    } else if(posecounter>=maxposescore/4){
      fill('#ebcb8b')
    } else {
      fill('#bf616a')
    }
    rect(20,100,(posecounter/maxposescore)*100,20)

  }
  // show volume bar if status 1
  if(volumebarstatus==1){
    drawvolumearea();
  }
}

function StopProgram() {
  stopbtn_call = true;
  programstatus = 0;
  volumebarstatus = 3;
  slider.hide();
  noLoop();
  clear();
  drawcameraarea();
  video=null;
  poseNet=null;
  pose = null;
  skeleton  = null;

  //hide the manual modal if opened
  const manualModal = document.getElementById('manualModal');
  if (manualModal.style.display === 'block') {manualModal.style.display = 'none';}
  document.body.classList.remove('guide-modal-open');
  document.body.style.backdropFilter = 'blur(5px)';
  
  // Show the modal
  document.body.classList.add('modal-open');
  const modal = document.getElementById("myModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  
  modal.style.display = "block";
  confirmBtn.onclick = function() {
    close();
  };

  cancelBtn.onclick = function() {
    modal.style.display = "none";
    location.reload(); //refresh page
  };
}

function windowResized() {
  windowSizeCheck()
}

function windowSizeCheck(){
  if(w>windowWidth){
    w = windowWidth;
    h = w*3/4;
    resizeCanvas(w,h);
    slider.position(cnv.position().x+w-160*w/640,cnv.position().y+h-30*w/640);
  }
  if(w<windowWidth){
    w = 640;
    h = 480;
    resizeCanvas(w,h);
    slider.position(cnv.position().x+480,cnv.position().y+h-30);
  }
  slider.style('width', 100*w/640+'px');
}
function mousePressed() {
  //windowSizeCheck()
}