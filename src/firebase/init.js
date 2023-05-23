import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA64A5h0yyysHAXcgAXleW0dmVr27HOCqo",
  authDomain: "monoestereotv.firebaseapp.com",
  projectId: "monoestereotv",
  storageBucket: "monoestereotv.appspot.com",
  messagingSenderId: "574702885108",
  appId: "1:574702885108:web:2c2bfa659cd064000f26a1",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default db
