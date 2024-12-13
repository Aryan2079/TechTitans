// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRq8ZJe_6G-G0UPv7a9KARd8dtKKBzOjg",
  authDomain: "hackathon-47e98.firebaseapp.com",
  projectId: "hackathon-47e98",
  storageBucket: "hackathon-47e98.firebasestorage.app",
  messagingSenderId: "229444100017",
  appId: "1:229444100017:web:f627510bb8da192aa42790",
  measurementId: "G-Y0V4EG3TS9",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth();
