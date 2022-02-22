import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlFW1iZlyuKtZNAURkJiRSBaVK2fyaEMc",
    authDomain: "coursemanagmentportal.firebaseapp.com",
    databaseURL: "https://coursemanagmentportal-default-rtdb.firebaseio.com",
    projectId: "coursemanagmentportal",
    storageBucket: "coursemanagmentportal.appspot.com",
    messagingSenderId: "300067894635",
    appId: "1:300067894635:web:424f4aff1e0661d253482e"
  };
const app = initializeApp(firebaseConfig);  
export const auth = getAuth(app);