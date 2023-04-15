import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "@firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBG-EH-IAVXCn4a15jvnfErZYp6yIiHTMs",
    authDomain: "five-seventy-five-827cb.firebaseapp.com",
    projectId: "five-seventy-five-827cb",
    storageBucket: "five-seventy-five-827cb.appspot.com",
    messagingSenderId: "791078910050",
    appId: "1:791078910050:web:91f76e6c4c214bf387393b",
    measurementId: "G-ZDYC274MKQ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);