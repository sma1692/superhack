import LLMCHAT from '../../services/llm/index.js'
import { RESOLUTION_PROMPT } from '../../services/system_prompts/index.js'
import { FixStepsModel } from '../fix-steps/model.js'
import { SuggestionsModel } from '../suggestions/model.js'
import { TickerModel } from '../tickets/model.js'
import { ResolutionModel } from './model.js'
import _ from 'lodash'

export async function getAllResolutions(req, res) {
  try {
    const docs = await ResolutionModel.find()
    if (_.isEmpty(docs)) {
      return res.status(404).json({ success: false, message: 'No resolutions found' })
    }
    return res.status(200).json({ success: true, message: 'Resolutions fetched', data: docs })
  } catch (error) {
    console.error("Fetch error:", error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function insertResolution(req, res) {
  try {
    const { ticket_id, description, status, rating, method } = req.body

    const doc = await ResolutionModel.create({
      ticket_id,
      description,
      status,
      rating,
      method
    })

    return res.status(201).json({
      success: true,
      message: "Resolution created successfully",
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

export async function getResolutionsForATicket(req, res) {
  const { ticket_id } = req.params

  try {
    const docs = await ResolutionModel.find({ ticket_id })

    if (!docs || docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No resolutions found for this ticket"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Resolutions fetched successfully",
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
export async  function generateResolution(req ,res){
  try {
    const {ticket_id , fix_steps_id , troubleshooting_id} = req.body
    let ticket , fix_step , troubleshooting
    ticket = await TickerModel.findById(ticket_id)

    if(fix_steps_id){
      fix_step = await FixStepsModel.findById(fix_steps_id)
    }
    if(troubleshooting){
      troubleshooting = await SuggestionsModel.findById(troubleshooting_id)
    }

    const llmInstance = new  LLMCHAT()
    const what = await llmInstance.sendQuery(RESOLUTION_PROMPT(ticket.title , ticket.description , ticket.id , troubleshooting?.suggestion , fix_step?.steps))
    let resolu =  'beep boop beep boop!!!!'
    for(let c of what.choices){
      resolu = c.message.content
      break
    }
    const resoDoc = await ResolutionModel.create({ticket_id:ticket_id , resolution:resolu , llm:what})
    return res.status(200).json({'success':true,data:{id:resoDoc._id , 'chat':resolu}})
  } catch (error) {
    console.error("Fetch error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}