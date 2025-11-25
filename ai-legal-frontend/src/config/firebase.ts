// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBRtBpD8V4z6659uwv1Ecg182M_mqEkfo",
  authDomain: "profilecard-df4aa.firebaseapp.com",
  projectId: "profilecard-df4aa",
  storageBucket: "profilecard-df4aa.firebasestorage.app",
  messagingSenderId: "1053631270330",
  appId: "1:1053631270330:web:72c0a82a342f34dfc2e183",
  measurementId: "G-RCRX36WQ4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const Auth = getAuth(app)
const analytics = getAnalytics(app);