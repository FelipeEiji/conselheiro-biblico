import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDWujVn_8mxXSE7l5MBkon8v6E6EOxvJGE",
  authDomain: "conselheiro-biblico.firebaseapp.com",
  projectId: "conselheiro-biblico",
  storageBucket: "conselheiro-biblico.appspot.com",
  messagingSenderId: "173409727851",
  appId: "1:173409727851:web:0d899a1ce1c59af95e882e",
  measurementId: "G-PFV25Q32F0",
};

const app = initializeApp(firebaseConfig);

export { app };
