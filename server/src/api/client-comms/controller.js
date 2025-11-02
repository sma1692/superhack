import LLMCHAT from '../../services/llm/index.js'
import { CLIENTCOMMS_PROMPT } from '../../services/system_prompts/index.js'
import { FixStepsModel } from '../fix-steps/model.js'
import { SuggestionsModel } from '../suggestions/model.js'
import { TickerModel } from '../tickets/model.js'
import { ClientCommModel } from './model.js'
import _ from 'lodash'

export async function getAllClientComms(req, res) {
  try {
    const docs = await ClientCommModel.find()
    if (_.isEmpty(docs)) {
      return res.status(404).json({ success: false, message: 'No client communications found' })
    }
    return res.status(200).json({ success: true, message: 'Client communications fetched', data: docs })
  } catch (error) {
    console.error("Fetch error:", error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function insertClientComm(req, res) {
  try {
    const { ticket_id, comms, status, tone } = req.body

    const doc = await ClientCommModel.create({
      ticket_id,
      comms,
      status,
      tone
    })

    return res.status(201).json({
      success: true,
      message: "Client communication created successfully",
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

export async function getClientCommsForATicket(req, res) {
  const { ticket_id } = req.params

  try {
    const docs = await ClientCommModel.find({ ticket_id })

    if (!docs || docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No client communications found for this ticket"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Client communications fetched successfully",
      data: docs
    })
  } catch (err) {
    console.error("Fetch error:", err)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    })
  }
}


// xport async function getTroubleShooting(req , res) {
//   try {
//     const ticketId = req.params.id
//     console.log(ticketId)
//     const docs = await TickerModel.findById(ticketId)
//     if(_.isEmpty(docs)){
//       return res.status(404).json({success:false , error:'no ticket'})
//     }
//     const llmInstance = new  LLMCHAT()

//     const what  = await llmInstance.sendQuery(TROUBLESHOOTING_PROMPT(docs?.title|| "NO TITLE" , docs?.description||"NO DESC" , ticketId))
//     let steps= 'beep boop beep boop!!!!'
//     for(let c of what.choices){
//       steps = c.message.content
//       break
//     }
//     await SuggestionsModel.create({ticket_id:ticketId , suggestion:steps , status:1 , llm:what})
//     return res.status(200).json({'success':true,'chat':steps})
//   } catch (error) {
//     console.log(`[Error]=== Got error in fixSteps ${error}`)
//      return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     })
//   }
// }

export async  function generateComms(req ,res){
  try {
    const {ticket_id , fix_steps_id , troubleshooting_id} = req.body
    let ticket , fix_step , troubleshooting
    ticket = await TickerModel.findById(ticket_id)
    console.log(req.body)
    if(fix_steps_id){
      fix_step = await FixStepsModel.findById(fix_steps_id)
    }
    if(troubleshooting_id){
      troubleshooting = await SuggestionsModel.findById(troubleshooting_id)
    }
    const llmInstance = new  LLMCHAT()
    const what = await llmInstance.sendQuery(CLIENTCOMMS_PROMPT(ticket.title , ticket.description , ticket.id , troubleshooting?.suggestion , fix_step?.steps))
    let com= 'beep boop beep boop!!!!'
    for(let c of what.choices){
      com = c.message.content
      break
    }
    const comsDoc = await ClientCommModel.create({ticket_id:ticket_id , comms:com , llm:what})
    return res.status(200).json({'success':true,data:{id:comsDoc._id , 'chat':com}})
  } catch (error) {
    console.error("Fetch error:", err)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}