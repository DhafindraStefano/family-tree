// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBF5pODzN22dyuMb8PfNpTbLFHhb80iD6U",
  authDomain: "silsilah-keluarga-ikadam.firebaseapp.com",
  projectId: "silsilah-keluarga-ikadam",
  storageBucket: "silsilah-keluarga-ikadam.firebasestorage.app",
  messagingSenderId: "654304723577",
  appId: "1:654304723577:web:3995fafff87f95d3b3caa8",
  measurementId: "G-W8Q61393H2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);