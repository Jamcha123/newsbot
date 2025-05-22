import OpenAI from "openai/index.mjs";
import axios from "axios";
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'
dotenv.config()

const ai = new OpenAI({apiKey: process.env.AI_KEY});

export default class newsbot{
    async generataHeadline(options = {"headline": "hello world"}){
        const response = await ai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user", 
                    content: [
                        {type: "text", text: "skriv ett kort 75 ord artikel om " + options["headline"] + " på engelska, snälla"}
                    ]
                }
            ],
        })
        return response.choices[0].message["content"]
    }
    async getHeadlines(){
        const webby = await axios.get("https://www.dn.se")
        const $ = cheerio.load(webby["data"])

        const data = $("div.ds-teaser__content h2.ds-teaser__title").text()
        return data.split("\n")
    } 
}
