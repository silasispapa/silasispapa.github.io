let alertsound;
function preload(){
  alertsound = createAudio('alert/bell.wav',alert_load);
}

function alert_load(){
 console.log("alert sound loaded.");
}

function playsound(){
  alertsound.play();
}

function setalertvolume(user_choice){
  alertsound.volume(user_choice/100); //max volume is 1 and min volume is 0
}

