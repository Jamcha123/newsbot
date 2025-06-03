import openai, { OpenAI } from 'openai'
import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import dotenv from 'dotenv'
import {TwitterApi} from 'twitter-api-v2'
import fs from 'fs'

const keys = JSON.parse(fs.readFileSync("keys.json", "utf-8"))

dotenv.config()
admin.initializeApp({
    projectId: "headlineai-4f9d4",
    credential: admin.credential.cert(keys)
})

const twitter = new TwitterApi({
    clientId: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET
})

const ai = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI,
})

const link = "http://localhost:5000/headlineai-4f9d4/us-central1/callback"

const db = admin.firestore().doc("tokens/auth")
export const auth = functions.https.onRequest({cors: true}, async (req, res) => {
    const {url, codeVerifier, state} = twitter.generateOAuth2AuthLink(link, {
        scope: ["tweet.write", "tweet.read", "users.read", "offline.access"]
    })
    await db.set({codeVerifier, state})
    res.redirect(url)
})

export const callback = functions.https.onRequest({cors: true}, async (req, res) => {
    const {state, code} = req.query
    
    const dbRef = await db.get()

    const {codeVerifier, state: storedState} = dbRef.data()
    if(state !== storedState){
        res.status(400).send(state + " doesn't match " + storedState)
        return res.end()
    }
    const {accessToken, refreshToken, client: loggedClient} = await twitter.loginWithOAuth2({code, codeVerifier, redirectUri: link})
    await db.set({accessToken, refreshToken})

    res.status(200).send("tokens created")
    return res.end()
})


export const tweet = functions.https.onRequest({cors: true}, async (req, res) => {
    const {refreshToken} = (await db.get()).data()
    
    const {client: refreshedClient, accessToken, refreshToken: newRefreshToken} = await twitter.refreshOAuth2Token(refreshToken)
    await db.set({accessToken, refreshToken: newRefreshToken})

    const files = fs.readFileSync("prompts.txt", "utf-8").split("\n")
    const response = await ai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
            {
                role: "user", 
                content: [
                    {type: "text", text: "write a short 10 word satire headline about " + files[Math.floor(Math.random() * files.length + 0)]}
                ]
            }
        ]
    })

    const {data} = await refreshedClient.v2.tweet("Satire headline: " + response.choices[0].message["content"])

    res.status(200).json(data)
    return res.end()
})