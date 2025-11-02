import LLMCHAT from '../../services/llm/index.js'
import { FIX_STEPS_SYSTEM_PROMPT } from '../../services/system_prompts/index.js'
import { TickerModel } from '../tickets/model.js'
import { FixStepsModel } from './model.js'
import _ from 'lodash'

export async function getAllFixSteps(req, res) {
  try {
    const docs = await FixStepsModel.find()
    if (_.isEmpty(docs)) {
      return res.status(404).json({ success: false, message: 'No fix steps found' })
    }
    return res.status(200).json({ success: true, message: 'Fix steps fetched', data: docs })
  } catch (error) {
    console.error("Fetch error:", error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function insertFixSteps(req, res) {
  try {
    const { ticket_id, steps, status } = req.body

    const doc = await FixStepsModel.create({
      ticket_id,
      steps,
      status
    })

    return res.status(201).json({
      success: true,
      message: "Fix steps created successfully",
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

export async function getFixStepsForATicket(req, res) {
  const { ticket_id } = req.params

  try {
    const docs = await FixStepsModel.find({ ticket_id })

    if (!docs || docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No fix steps found for this ticket"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Fix steps fetched successfully",
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



export async function getFix_Steps(req , res) {
  try {
    const ticketId = req.params.id
    console.log(ticketId)
    const docs = await TickerModel.findById(ticketId)
    if(_.isEmpty(docs)){
      return res.status(404).json({success:false , error:'no ticket'})
    }
    const llmInstance = new  LLMCHAT()

    const what  = await llmInstance.sendQuery(FIX_STEPS_SYSTEM_PROMPT(docs?.title|| "NO TITLE" , docs?.description||"NO DESC" , ticketId , docs?.tags))
    let steps= 'beep boop beep boop!!!!'
    for(let c of what.choices){
      steps = c.message.content
      break
    }
    const fix = await FixStepsModel.create({ticket_id:ticketId , steps:steps , status:1 , llm:what})
    return res.status(200).json({'success':true,data:{id:fix._id,'chat':steps}})
  } catch (error) {
    console.log(`[Error]=== Got error in fixSteps ${error}`)
     return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    })
  }
}