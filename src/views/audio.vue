<template >
  <div class="center">
    <div style="max-width: 28em">
      <div >
        <h3>Welcomeback   <strong class="white-bold" >{{neptun}}</strong></h3>
        <p>Read out the text below:</p>
        <div class="center"><h1 style="font-size: 70px;">{{textToRead}}</h1></div>
      </div>
      <p v-if="stopButton">Click <strong class="white-bold" >Record</strong> button to start recording</p>
      <p v-if="recordButton">Recording . . . </p>  
      <p v-if="recordButton">Click <strong class="white-bold">Stop</strong> button to stop recording</p>
      <div id="controls">
        <button
          id="recordButton"
          @click="startRecording"
          :disabled="recordButton"
          style="width: 200px; height: 40px;"
        >
          Record
        </button>
        <button id="stopButton" :disabled="stopButton" @click="stopRecording" style="width: 200px; height: 40px;">
          Stop
        </button>
      </div>
      
      <h2 style="margin-top: 20px;">Recordings</h2>
      <ol id="recordingsList"></ol>
      <li v-for="audio in audioList" :key="audio">
        <div class="center">
          <audio :src="audio.url" controls></audio>
          <button class="save" @click="saveRecord(audio)" :disabled="audio.disabled">Save record</button>
        </div>
        <p>download link: <a :href="audio.url" :download="audio.audioName">{{  audio.audioName }}</a></p>
      </li>
    </div>
  </div>
</template>


<script setup>
import {onMounted,reactive,ref} from "vue"
import axios from 'axios';

const neptun = ref(sessionStorage.getItem("neptun"))

onMounted(() => {
  if(!neptun){
    router.push("/");
  }
  readText()
})
const filePath = "../../textdataset/data.txt"
const textToRead = ref(null)
var content = null
var currentText = 0

const readText = ()=>{
  axios.get(filePath)
  .then(res=>{
    content = res.data;
    textToRead.value = content.split('\n')[currentText]
  })
}

const saveRecord = (button) =>{
  button.disabled = true;
  currentText=currentText+1
  textToRead.value = content.split('\n')[currentText]
}

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; //stream from getUserMedia()
var recorder; //WebAudioRecorder object
var input; //MediaStreamAudioSourceNode  we'll be recording


// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;


const audioList = reactive([]);

const recordButton = ref(false);
const stopButton = ref(true);

var encodingType = "wav";
var encodeAfterRecord = true;

const startRecording = () => {
  console.log("startRecording() called");

  // We'll us a simple constraints object, for more advanced features see https://blog.addpipe.com/audio-constraints-getusermedia/
  var constraints = {
    audio: true,
    video: false,
  };

  /* We're using the standard promise based getUserMedia() https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {

      //assign to gumStream for later use
      gumStream = stream;
      // when to encode
      var audioContext = new AudioContext();
      /* use the stream */
      input = audioContext.createMediaStreamSource(stream);

      //stop the input from playing back through the speakers
      //input.connect(audioContext.destination)

      recorder = new WebAudioRecorder(input, {
        // workerDir: "/lib/",
        encoding: encodingType,
        numChannels: 2,
        onEncoderLoading: async function (recorder, encoding) {
          // show "loading encoder..." display
          // __log("Loading " + encoding + " encoder...");
        },
        onEncoderLoaded: async function (recorder, encoding) {
          // hide "loading encoder..." display
          // __log(encoding + " encoder loaded");
        },
      });

      recorder.onComplete = function (recorder, blob) {
        // __log("Encoding complete");
        createDownloadLink(blob, recorder.encoding);
      };
      recorder.setOptions({
        timeLimit: 120,
        encodeAfterRecord: encodeAfterRecord,
        ogg: {
          quality: 0.5,
        },
        mp3: {
          bitRate: 160,
        },
      });
      //start the recording process
      recorder.startRecording();
      // __log("Recording started");
    })
    .catch(function (err) {
      //enable the record button if getUSerMedia() fails
      recordButton.value = false;
      stopButton.value = true;
    });

  //disable the record button
  recordButton.value = true;
  stopButton.value = false;
};

const stopRecording = () => {
  //stop microphone access
  gumStream.getAudioTracks()[0].stop();

  //disable the stop button
  stopButton.value = true;
  recordButton.value = false;

  //tell the recorder to finish the recording (stop recording + encode the recorded audio)
  recorder.finishRecording();
  // __log("Recording stopped");
};

const createDownloadLink = (blob, encoding) => {
  var url = URL.createObjectURL(blob);
  var audioName = (neptun.value + "_" + textToRead.value + "_"+ new Date().valueOf() + ".").replace(/\s/g, "") + encoding;
  audioList.unshift({
    url: url,
    audioName: audioName,
  });
};

//helper function
const __log = (e, data) => {
  log.innerHTML += "\n" + e + " " + (data || "");
};
</script>
<style scoped>
.save{
  margin-left: 10px;
  padding: 25px 10px;

}
.white-bold{
  font-weight:bold; 
  font-size:20px;
  color: white;
}
p {
  margin: 1em 0;
}

red {
  color: red;
}

a {
  color: #337ab7;
}
p {
  margin-top: 1rem;
}
a:hover {
  color: #23527c;
}
a:visited {
  color: #8d75a3;
}

#controls {
  display: flex;
  margin-top: 2rem;
}
button {
  flex-grow: 1;
  height: 2.5rem;
  min-width: 2rem;
  border: none;
  border-radius: 0.15rem;
  background: #ed341d;
  margin-left: 2px;
  box-shadow: inset 0 -0.15rem 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 1rem;
}
button:hover,
button:focus {
  outline: none;
  background: #c72d1c;
}
button::-moz-focus-inner {
  border: 0;
}
button:active {
  box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.2);
  line-height: 3rem;
}
button:disabled {
  pointer-events: none;
  background: lightgray;
}
button:first-child {
  margin-left: 0;
}
audio {
  display: block;
  width: 100%;
  margin-top: 0.2rem;
}
li {
  list-style: none;
  margin-bottom: 1rem;
}
</style>