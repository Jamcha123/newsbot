import { initializeApp } from 'firebase/app'; 
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getAuth, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


const config = {
    apiKey: "",
    authDomain: "headlineai-4f9d4.firebaseapp.com",
    projectId: "headlineai-4f9d4",
    storageBucket: "headlineai-4f9d4.firebasestorage.app",
    messagingSenderId: "553867878032",
    appId: "1:553867878032:web:9e4953d8f3a532f2f98215",
    measurementId: "G-9S8DRYK8RJ"
}

const app = initializeApp(config); 

const appcheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider("6LeUS0YrAAAAAFeRGFLiRAsmgp6IEoEpm1i4_Gd-"),
    isTokenAutoRefreshEnabled: true
})

const auth = getAuth(app)
auth.useDeviceLanguage()


onAuthStateChanged(auth, (user) => {
    if(user == null){
        console.log("user, not found")
    }else{
        console.log("user, logged in")
    }
})

const db = getFirestore(app)
