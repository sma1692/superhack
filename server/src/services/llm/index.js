import { MASTER_PROMPT } from "../system_prompts";
import axios from "axios"
import {llmBaseURL} from  '../../config'


class LLMCHAT{
    constructor(baseUrl=llmBaseURL){
        this.baseUrl = baseUrl
        this.axiosInstance = axios.create({
            baseURL:baseUrl
        })
    }

    async sendQuery(actionPrompt , masterPrompt=MASTER_PROMPT){
        try {
            const combinedPrompt = masterPrompt+actionPrompt
            console.log(`[Prompt]:== ${combinedPrompt}`)
            let res = await this.axiosInstance.post('/chat' , {'messages':[{'role':"user"  , "content":combinedPrompt}]})
            return res.data
        } catch (error) {
            console.log(`[Error]:=== ${error}`)
        }
    }
}

export default LLMCHAT