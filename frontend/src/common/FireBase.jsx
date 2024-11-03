// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLwYwrwb9tEcG7qSzrJ9VQu1VeWeH9l8E",
  authDomain: "prepinsights-523c5.firebaseapp.com",
  projectId: "prepinsights-523c5",
  storageBucket: "prepinsights-523c5.appspot.com",
  messagingSenderId: "443633863807",
  appId: "1:443633863807:web:43222b75983c4561ae034a",
  measurementId: "G-W4EGWJ60FL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//google auth

const provider=new GoogleAuthProvider()

const auth=getAuth()

export const authwithGoogle=async ()=>{
   let user=null;
   await signInWithPopup(auth,provider)
   .then((result)=>{
    user=result.user
   })
   .catch((err)=>{
    console.log(err)
   })
   return user
}