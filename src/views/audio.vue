<template >
  <div>
    <div style="max-width: 28em">
      <div id="controls">
        <button
          id="recordButton"
          @click="startRecording"
          :disabled="recordButton"
        >
          Record
        </button>
        <button id="stopButton" :disabled="stopButton" @click="stopRecording">
          Stop
        </button>
      </div>
      <pre>Log</pre>
      <pre id="log"></pre>

      <pre>Recordings</pre>
      <ol id="recordingsList"></ol>
      <li v-for="audio in audioList" :key="audio">
        <audio :src="audio" controls></audio>
        <link :href="audio" :download="audioName" />{{ audioName }}
      </li>
    </div>
  </div>
</template>


<script setup>
//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; //stream from getUserMedia()
var recorder; //WebAudioRecorder object
var input; //MediaStreamAudioSourceNode  we'll be recording


// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;

import { reactive, ref } from "vue";
const audioList = reactive([]);

const recordButton = ref(false);
const stopButton = ref(true);

var encodingType = "mp3";
var encodeAfterRecord = true;

const startRecording = async () => {
  console.log("startRecording() called");

  // We'll us a simple constraints object, for more advanced features see https://blog.addpipe.com/audio-constraints-getusermedia/
  var constraints = {
    audio: true,
    video: false,
  };

  /* We're using the standard promise based getUserMedia() https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
  await navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      __log(
        "getUserMedia() success, stream created, initializing WebAudioRecorder..."
      );

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
          __log("Loading " + encoding + " encoder...");
        },
        onEncoderLoaded: async function (recorder, encoding) {
          // hide "loading encoder..." display
          __log(encoding + " encoder loaded");
        },
      });

      recorder.onComplete = function (recorder, blob) {
        __log("Encoding complete");
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
      __log("Recording started");
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
  console.log("stopRecording() called");

  //stop microphone access
  gumStream.getAudioTracks()[0].stop();

  //disable the stop button
  stopButton.value = true;
  recordButton.value = false;

  //tell the recorder to finish the recording (stop recording + encode the recorded audio)
  recorder.finishRecording();

  __log("Recording stopped");
};

const createDownloadLink = (blob, encoding) => {
  __log("save call");
  var url = URL.createObjectURL(blob);
  var audioName = new Date().toISOString() + "." + encoding;
  audioList.push({
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
h1 {
  text-decoration: underline red;
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
  font-size: 220%;
  font-weight: bold;
}

h2 {
  font-weight: bold;
  color: #005a9c;
  font-size: 140%;
  text-transform: uppercase;
}

p {
  margin: 1em 0;
}

pre {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
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