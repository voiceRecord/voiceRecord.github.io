<template>
    <div class="home">
        <div class="center pad" id="isRecording"><h2>{{ recordState }}</h2></div>
        <div class="center pad">
            <button id="startRecording" @click="initFunction">Start</button>
            <button id="stopRecording">Stop</button>
        </div>
        <!-- <div class="center pad"><button @click="goadmin">go admin</button></div> -->
        
        <br />
        <div class="record">
            <div class="center pad">
                <h3>recorded audio</h3>
            </div>
            <div class="center pad">
                <div class="center pad">
                    <audio src="" id="audioElement" controls></audio>
                    <button style="margin: 0.5rem 1rem;">Delete</button>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
let start = true
let stop = false

import router from '@/router'
import { ref } from 'vue';

const goadmin = () =>{
  router.push('/admin')
}

let recordState = ref("Click start button to record")

function initFunction() {

    async function getUserMedia(constraints) {
         // Request access to the user's microphone
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (window.navigator.mediaDevices) {
            return window.navigator.mediaDevices.getUserMedia(constraints);
        }

        let legacyApi = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (legacyApi) {
        return new Promise(function (resolve, reject) {
            legacyApi.bind(window.navigator)(constraints, resolve, reject);
        });
        } else {
        alert("user api not supported");
        }
    }

  recordState = "Recording...";

  //
  let audioChunks = [];
  let rec;
  function handlerFunction(stream) {
    rec = new MediaRecorder(stream);
    rec.start();
    rec.ondataavailable = (e) => {
      audioChunks.push(e.data);
      if (rec.state == "inactive") {
        let blob = new Blob(audioChunks, { type: "audio/mp3" });
        console.log(blob);
        document.getElementById("audioElement").src = URL.createObjectURL(blob);
      }
    };
  }
  function startusingBrowserMicrophone(boolean) {
    getUserMedia({ audio: boolean }).then((stream) => {
      handlerFunction(stream);
    });
  }
  startusingBrowserMicrophone(true);
  // Stoping handler
  document.getElementById("stopRecording").addEventListener("click", (e) => {
    rec.stop();
    recordState = "Click play button to start listening";
  });
}


</script>
<style>
    
</style>