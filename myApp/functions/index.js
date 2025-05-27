import * as functions from 'firebase-functions'
import admin from  'firebase-admin'
import Stripe from 'stripe';
import OpenAI from 'openai/index.mjs'
import dotenv from 'dotenv'; 
dotenv.config()

admin.initializeApp()

const stripe = new Stripe(process.env.STRIPEKEY)

const ai = new OpenAI({
    apiKey: process.env.AIKEY
})

export const checkout = functions.https.onRequest({cors: true}, async (req, res) => {
    const amount = Number.parseInt(req.query.amount)
    const user = req.query.user

    const current = new Date()
    const later = new Date(current.getTime() + 30 * 60 * 1000);

    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: "price_1RTKtqBJFXFW6fU3FmwOyTo7", 
                quantity: amount
            }
        ],
        automatic_tax: {enabled: true}, 
        mode: "payment", 
        currency: "usd", 
        expires_at: Math.floor(later.getTime() / 1000), 
        cancel_url: "http://127.0.0.1:5173", 
        success_url: "https://addrequests-mfckxper5q-uc.a.run.app?items=" + amount + "&user=" + user
    })
    res.redirect(301, session.url)
})

export const addRequests = functions.https.onRequest({cors: true}, async (req, res) => {
    const items = Number.parseInt(req.query.items)
    const user = req.query.user

    const userid = (await admin.auth().getUser(user)).toJSON()

    const db = await admin.firestore().collection("usage").doc(userid["uid"]);
    const docref = await db.get()
    if(await docref.exists){
        const docs = await docref.data().requests 
        await admin.firestore().doc("usage/" + userid["uid"]).set({requests: docs+(items*10)})
    
        res.redirect(301, "https://headlineai-4f9d4.firebaseapp.com")
    }else{
        res.status(200).send("field not found")
        return res.end()
    }
})

export const generateHeadlines = functions.https.onRequest({cors: true}, async (req, res) => {
    const about = req.query.about
    const options = req.query.options

    const response = await ai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
            {
                role: "user", 
                content: [
                    {type: "text", text: "write a short 6 word " + options + "headline about " + about}
                ]
            }
        ]
    })
    res.status(200).send(response.choices[0].message["content"])
    return res.end()
})