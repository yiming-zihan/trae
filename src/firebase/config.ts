import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBj-Ymzrl3I80TWrA1FKHJAzG609WtKmls",
  authDomain: "zihan-kitchen.firebaseapp.com",
  projectId: "zihan-kitchen",
  storageBucket: "zihan-kitchen.firebasestorage.app",
  messagingSenderId: "286826188653",
  appId: "1:286826188653:web:8ecea2cd849654214bd464"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
