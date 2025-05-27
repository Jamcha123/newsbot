import { useState, useEffect, useRef } from 'react'
import './App.css'
import {motion} from 'framer-motion'
import axios from 'axios'
import * as cheerio from 'cheerio'
import copied from './assets/copy2.png'
import gologin from './assets/google.webp'
import gitlogin from './assets/git.png'
import './fire.js'
import { initializeApp } from 'firebase/app'; 
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getAuth, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { collection, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'


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

const auth = getAuth(app)
auth.useDeviceLanguage()

const git = new GithubAuthProvider()
git.addScope("https://github.com/Jamcha123/newsbot")

const google = new GoogleAuthProvider()

const db = getFirestore(app) 

function AddNavbar(){
    useEffect(() => {
        const checkout = document.getElementById("checkoutlink")
        onAuthStateChanged(auth, async (user) => {
            const link = "https://checkout-mfckxper5q-uc.a.run.app?amount=1&user=" + user.uid
            checkout.href = link
        })
    })
    return(
        <nav className="fixed w-[100%] h-[fit-content] m-auto p-[0] bg-transparent z-[99] top-[2%] flex flex-col align-middle justify-center text-center ">
            <ul className="relative w-[100%] m-auto p-[0] h-[fit-content] flex flex-row align-middle justify-center text-center ">
                <h1 className="text-3xl text-white ">HeadlinesAI - Generate headlines</h1>
            </ul>
            <ul className="relative w-[100%] m-auto p-[0] h-[fit-content] flex flex-row align-middle justify-center text-center ">
                <div className="flex flex-row align-middle justify-center gap-[20px] text-center relative m-auto p-[0] w-[fit-content] h-[fit-content] " id="logout">
                    <h1 className="text-2xl text-violet-300">
                        <a onClick={() => signOut(auth)} className="underline cursor-pointer underline-offset-2">Logout</a>
                    </h1>
                    <h1 className="text-2xl text-violet-200">
                        <a id='checkoutlink' className="underline underline-offset-2 cursor-pointer ">Buy requests</a>
                    </h1>
                </div>
                <div className="flex flex-row align-middle justify-center text-center relative w-[fit-content] h-[fit-content] m-auto p-[0] bg-transparent ">
                    <h1 className="text-3xl text-white" id="limit"></h1>
                </div>
            </ul>
        </nav>
    )
}

export default function App(){
    const [active, setActive] = useState(false)
    useEffect(() => {
        const form = document.getElementById("form");   
        const options = document.getElementById("options")
        const input = document.getElementById("input")
        const output = document.getElementById("output")

        
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            document.getElementById("showing").style.display = "flex"
            let target = window.localStorage.getItem("limit")
            if(target != 0){
                const link = "https://generateheadlines-mfckxper5q-uc.a.run.app?about=" + input.value + "&options=" + options.value;
                const webby = await axios.get(link)
                
                output.innerText = webby["data"]
                window.localStorage.setItem("limit", target-1)
                onAuthStateChanged(auth, async (user) => {
                    await setDoc(doc(db, "/usage/" + user.uid), {requests: target-1})
                })
            }else{
                alert("out of requests")
                window.localStorage.setItem("limit", 0)
                onAuthStateChanged(auth, async (user) => {
                    await setDoc(doc(db, "/usage/" + user.uid), {requests: 0})
                })
            }
            limit.innerText = "Requests left: " + window.localStorage.getItem("limit")
        })

        const limit = document.getElementById("limit")
        if(window.localStorage.getItem("limit") == null){
            window.localStorage.setItem("limit", Number.parseInt(5))
        }
        limit.innerText = "Requests left: " + window.localStorage.getItem("limit")

        document.getElementById("github").addEventListener("click", (e) => {
            e.preventDefault()
            signInWithPopup(auth, git)
        })
        document.getElementById("google").addEventListener("click", (e) => {
            e.preventDefault()
            signInWithPopup(auth, google)
        })

        onAuthStateChanged(auth, (user) => {
            if(user == null){
                document.getElementById("logintext").style.display = "block";
                document.getElementById("loginpage").style.display = "flex"; 
                document.getElementById("logout").style.display = "none"; 
            }else{
                document.getElementById("logout").style.display = "flex"; 
                document.getElementById("logintext").style.display = "none";
                document.getElementById("loginpage").style.display = "none"; 
            }
        })

        onAuthStateChanged(auth, async (user) => {
            if(user != null){
                const target = (await getDoc(doc(db, "usage/" + user.uid))).get("requests")
                if(target == null){
                    let local = Number.parseInt(window.localStorage.getItem("limit"))
                    local += 10;
                    await setDoc(doc(db, "/usage/" + user.uid), {
                        requests: local
                    })
                }
                window.localStorage.setItem("limit", target)
                limit.innerText = "Requests left: " + target

            }
        })
    })
    return(
        <div className="fixed w-[100%] h-[100%] m-auto p-[0] bg-gray-700 flex flex-col align-middle justify-center text-center  ">
            <AddNavbar></AddNavbar>
            <div className="flex flex-col align-middle justify-center text-center relative m-auto p-[0] min-w-[100%] min-h-[75vh] ">
                <div className="flex flex-col align-middle justify-center text-center relative w-[100%] h-[75%] ">
                    <form action="" id="form" className="relative w-[100%] h-[20em] m-0 p-[0] flex flex-col align-middle justify-center text-center" method="get">
                        <select name="options" className="relative w-[75%] md:w-[50%] h-[2em] m-auto p-[0] text-center text-2xl text-black bg-slate-200 cursor-pointer " id="options">
                            <option className="cursor-pointer" value="funny">funny</option>
                            <option className="cursor-pointer" value="polarizing">polarizing</option>
                            <option className="cursor-pointer" value="rational">rational </option>
                            <option className="cursor-pointer" value="fake">Fake news</option>
                            <option className="cursor-pointer" value="dramatic">Dramatic</option>
                        </select>
                        <input type="text" required placeholder="what is the headline about?" id="input" className="relative w-[75%] md:w-[50%] h-[3em] m-auto p-[0] text-center text-2xl text-black bg-slate-300 " />
                        <motion.input initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} type="submit" id="submit" placeholder='Create A Headline ' value="Create A Headline " className="relative w-[75%] md:w-[50%] h-[3em] m-auto p-[0] text-center text-2xl border-sky-400 border-[3px] text-black bg-slate-400 cursor-pointer" />
                    </form>
                </div>
                <div className="flex flex-col align-middle justify-center text-center relative w-[100%] md:w-[100%] m-auto p-[0] h-[25%]  ">
                    <motion.div id="showing" className="relative w-[100%] h-[3em] m-auto p-[0] bg-transparent hidden flex-row align-middle justify-center text-center ">
                        <div className="relative w-[100%] h-[fit-content] m-auto p-[0] bg-transparent flex flex-col align-middle justify-center text-center ">
                            <h1 id="output" className="text-3xl text-white "></h1>
                        </div>
                    </motion.div>
                    <h1 id="logintext" className="text-2xl text-white mt-[5%] mb-[5%]">Login to get more requests</h1>
                    <div id="loginpage" className="flex flex-row align-middle justify-center text-center relative w-[35%] h-[5em] m-auto p-[0] ">
                        <div className="flex flex-col align-middle justify-center relative w-[6em] h-[100%] m-auto p-[0] ">
                            <div className="flex flex-row">
                                <motion.img id="google" className="cursor-pointer" initial={{scale: 1}} whileHover={{scale: 0.9}} whileTap={{scale: 1.1}} width={100 + "%"} height={100 + "%"} src={gologin} alt=""></motion.img>
                            </div>
                        </div>
                        <div className="flex flex-col align-middle justify-center relative w-[6em] h-[100%] m-auto p-[0] ">
                            <motion.img id="github" className="cursor-pointer" initial={{scale: 1}} whileHover={{scale: 0.9}} whileTap={{scale: 1.1}} width={65 + "%"} height={100 + "%"} src={gitlogin} alt=""></motion.img>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}