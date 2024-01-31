import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyD6xyq5OpN70Z8r3UYRbTCTpKRixzsmPf0",
    authDomain: "voice-recording-1fc90.firebaseapp.com",
    projectId: "voice-recording-1fc90",
    storageBucket: "voice-recording-1fc90.appspot.com",
    messagingSenderId: "222717438916",
    appId: "1:222717438916:web:1d8e1fd4fd4e7ef4b59291"
};
//init firebase
initializeApp(firebaseConfig);

//init firestore service
const db = getFirestore();

export default db;