import LLMCHAT from '../../services/llm/index.js'
import { TROUBLESHOOTING_PROMPT } from '../../services/system_prompts/index.js'
import { TickerModel } from '../tickets/model.js'
import { SuggestionsModel } from './model.js'
import _ from 'lodash'

export async function getAllSuggestions(req, res) {
  try {
    const docs = await SuggestionsModel.find()
    if (_.isEmpty(docs)) {
      return res.status(400).json({ success: false, message: 'No suggestions found' })
    }
    return res.status(200).json({ success: true, message: 'Suggestions fetched', data: docs })
  } catch (error) {
    console.error("Fetch error:", error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function insertSuggestion(req, res) {
  try {
    const { ticket_id, suggestion, status } = req.body

    const doc = await SuggestionsModel.create({
      ticket_id,
      suggestion,
      status
    })

    return res.status(201).json({
      success: true,
      message: "Suggestion created successfully",
      data: doc
    })
  } catch (err) {
    console.error("Insert error:", err)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    })
  }
}



export async function getSuggestionsForATicket(req, res) {
  const { ticket_id } = req.params;

  try {
    const docs = await SuggestionsModel.find({ ticket_id });

    if (!docs || docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No suggestions found for this ticket"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Suggestions fetched successfully",
      data: docs
    });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
}



export async function getTroubleShooting(req , res) {
  try {
    const ticketId = req.params.id
    console.log(ticketId)
    const docs = await TickerModel.findById(ticketId)
    if(_.isEmpty(docs)){
      return res.status(404).json({success:false , error:'no ticket'})
    }
    const llmInstance = new  LLMCHAT()

    const what  = await llmInstance.sendQuery(TROUBLESHOOTING_PROMPT(docs?.title|| "NO TITLE" , docs?.description||"NO DESC" , ticketId , docs?.tags))
    let steps= 'beep boop beep boop!!!!'
    for(let c of what.choices){
      steps = c.message.content
      break
    }
    const suggestionDoc = await SuggestionsModel.create({ticket_id:ticketId , suggestion:steps , status:1 , llm:what})
    return res.status(200).json({'success':true,data:{id:suggestionDoc._id,'chat':steps}})
  } catch (error) {
    console.log(`[Error]=== Got error in fixSteps ${error}`)
     return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}