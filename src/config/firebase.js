// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXGa8v_GotnI0ZHm_U6xN3ITkV7XutkVw",
  authDomain: "fwms-81d78.firebaseapp.com",
  projectId: "fwms-81d78",
  storageBucket: "fwms-81d78.appspot.com",
  messagingSenderId: "282664538225",
  appId: "1:282664538225:web:04881196855d61b2b24bd0",
  measurementId: "G-6JFJZ57MV2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
