<template >
  <div class="center">
    <div style="max-width: 28em">
      <div>
        <h3>
          Welcomeback <strong class="white-bold">{{ neptun }}</strong>
        </h3>
        <p>Read out the text below:</p>
        <h1 class="textToRead">{{ textToRead }}</h1>
      </div>
      <p v-if="stopButton">
        Click <strong class="white-bold">Record</strong> button to start
        recording
      </p>
      <p v-if="recordButton">Recording . . .</p>
      <p v-if="recordButton">
        Click <strong class="white-bold">Stop</strong> button to stop recording
      </p>
      <div id="controls">
        <button
          id="recordButton"
          @click="startRecording"
          :disabled="recordButton"
          style="width: 200px; height: 40px"
        >
          Record
        </button>
        <button
          id="stopButton"
          :disabled="stopButton"
          @click="stopRecording"
          style="width: 200px; height: 40px"
        >
          Stop
        </button>
      </div>
      <h2 style="margin-top: 20px">
        Recorded {{ currentText }} words over {{ content.length }}
      </h2>
      <h2 style="margin-top: 20px">Recordings</h2>
      <ol id="recordingsList"></ol>
      <li v-for="audio in audioList" :key="audio">
        <div class="center">
          <audio :src="audio.url" controls></audio>
          <button
            class="save"
            @click="saveRecord(audio)"
            :disabled="audio.disabled"
          >
            {{ audio.saveState }}
          </button>
        </div>
        <p>
          {{ audio.audioName }}
        </p>
      </li>
      <div class="center">
        <button
          class="list-more"
          v-if="nextPageToken"
          @click="listMoreAudio"
          :disabled="disloadmore"
        >
          list more records
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import router from "@/router";
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import {
  ref as storageRef,
  uploadBytes,
  list,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, db } from "@/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import filePath from "../assets/data.txt";

const id = parseInt(sessionStorage.getItem("id"));
const neptun = ref(sessionStorage.getItem("neptun"));
const textToRead = ref(null);
var content = reactive([]);
var currentText = 0 + parseInt(sessionStorage.getItem("textComplete"));
const audioList = reactive([]);
var nextPageToken = null;
var disloadmore = false; //disbale load more button

onMounted(() => {
  if (!neptun.value) {
    router.push("/");
  } else {
    readText();
    ListSaveAudio();
  }
});

const readText = async () => {
  axios.get(filePath).then((res) => {
    content = res.data;
    //split the context string into object with multiple strings
    content = content.split("\n");

    if (id % 2 == 0) {
      //read from bottom to top
      content.reverse();
      textToRead.value = content[currentText];
    } else {
      //read normally
      textToRead.value = content[currentText];
    }
  });
};

const ListSaveAudio = async () => {
  const listRef = storageRef(storage, "audio/" + neptun.value);
  const audios = await list(listRef, { maxResults: 5 });
  if (audios.nextPageToken) nextPageToken = audios.nextPageToken;
  audios.items.forEach((itemRef) => {
    const audioName = itemRef._location.path_.split("/").pop();
    getDownloadURL(itemRef).then((url) => {
      audioList.unshift({
        ref: itemRef,
        url: url,
        audioName: audioName,
        disabled: true,
        saveState: "uploaded !",
      });
    });
  });
};

const listMoreAudio = async () => {
  disloadmore = true;
  const listRef = storageRef(storage, "audio/" + neptun.value);
  const audios = await list(listRef, {
    maxResults: 5,
    pageToken: nextPageToken,
  });
  nextPageToken = null;
  if (audios.nextPageToken) nextPageToken = audios.nextPageToken;
  audios.items.forEach((itemRef) => {
    const audioName = itemRef._location.path_.split("/").pop();
    getDownloadURL(itemRef).then((url) => {
      audioList.push({
        ref: itemRef,
        url: url,
        audioName: audioName,
        disabled: true,
        saveState: "uploaded !",
      });
    });
  });
  disloadmore = false;
};

const saveRecord = (audio) => {
  // save new or replace
  if (audio.audioTextNumber == currentText) {
    let text =
      "Do you want to save the record to database!\nEnter OK to confirm";
    if (confirm(text) == true) {
      audio.disabled = true;
      audio.saveState = "uploading...";
      const fileRef = storageRef(
        storage,
        "audio/" + neptun.value + "/" + audio.audioName
      );
      uploadBytes(fileRef, audio.blob).then((snapshot) => {
        audio.ref = snapshot.ref;
        audio.saveState = "uploaded !";
      });
      if (currentText == content.length - 1) {
        alert("you finish all the word! the next word will start over again");
        currentText == 0;
      }
      currentText = currentText + 1;
      sessionStorage.setItem("textComplete", currentText);
      textToRead.value = content[currentText];
      console.log(id.toString());
      const userRef = doc(db, "user", id.toString());

      console.log(currentText);

      updateDoc(userRef, {
        textComplete: currentText,
      });
    }
  } else {
    let text =
      "You already upload audio for the word " +
      audio.text +
      "\nDo you want to replace it?\nEnter OK to confirm";
    if (confirm(text) == true) {
      //upload the audio
      audio.disabled = true;
      audio.saveState = "uploading...";
      const fileRef = storageRef(
        storage,
        "audio/" + neptun.value + "/" + audio.audioName
      );
      uploadBytes(fileRef, audio.blob).then((snapshot) => {
        audio.ref = snapshot.ref;
        audio.saveState = "uploaded !";
      });

      //get the uploaded audio and delete it from both local and server
      for (let i = 0; i < audioList.length; i++) {
        let item = audioList[i];
        if (
          item.audioName.includes(audio.text.trim()) &&
          item.saveState == "uploaded !"
        ) {
          deleteObject(item.ref).then(() => {
            const index = audioList.indexOf(item);
            if (index !== -1) {
              audioList.splice(index, 1);
            }
          });
          break;
        }
      }
    }
  }
};

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;
var gumStream; //stream from getUserMedia()
var recorder; //WebAudioRecorder object
var input; //MediaStreamAudioSourceNode  we'll be recording
// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;

const recordButton = ref(false);
const stopButton = ref(true);
var encodingType = "wav";
var encodeAfterRecord = true;

const startRecording = () => {
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
        workerDir: "public/lib/",
        encoding: encodingType,
        numChannels: 2,
        onEncoderLoading: async function (recorder, encoding) {},
        onEncoderLoaded: async function (recorder, encoding) {},
      });

      recorder.onComplete = function (recorder, blob) {
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
};

const createDownloadLink = (blob, encoding) => {
  var url = URL.createObjectURL(blob);
  var audioName =
    (
      neptun.value +
      "_" +
      textToRead.value +
      "_" +
      new Date().valueOf() +
      "."
    ).replace(/\s/g, "") + encoding;
  audioList.unshift({
    text: textToRead.value,
    url: url,
    audioName: audioName,
    blob: blob,
    saveState: "save",
    disabled: false,
    audioTextNumber: currentText,
  });
};
</script>
<style scoped>
.save {
  margin-left: 25px;
  padding: 25px;
  white-space: nowrap;
  min-width: 93.85px;
}
.white-bold {
  font-weight: bold;
  font-size: 20px;
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
.list-more {
  height: 55px;
  max-width: 155px;
}
.textToRead {
  font-size: 60px;
  display: grid;
  text-align: center;
}
</style>