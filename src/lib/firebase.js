import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyB5GDoKIjl0I3Zd62pt4wCvnyZPHCKIUSI",
  authDomain: "salon-app-8c40d.firebaseapp.com",
  projectId: "salon-app-8c40d",
  storageBucket: "salon-app-8c40d.firebasestorage.app",
  messagingSenderId: "70172727359",
  appId: "1:70172727359:web:70496908af6a91e999408a",
  measurementId: "G-PN6B2131HT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
