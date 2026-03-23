import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBF5pODzN22dyuMb8PfNpTbLFHhb80iD6U",
  authDomain: "silsilah-keluarga-ikadam.firebaseapp.com",
  projectId: "silsilah-keluarga-ikadam",
  storageBucket: "silsilah-keluarga-ikadam.firebasestorage.app",
  messagingSenderId: "654304723577",
  appId: "1:654304723577:web:3995fafff87f95d3b3caa8",
  measurementId: "G-W8Q61393H2",
};

// Avoid re-initialising when Next.js hot-reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);