import { Router } from 'express'
import { getAllClientComms, insertClientComm, getClientCommsForATicket , generateComms } from './controller.js'
import { middleware as body } from 'bodymen'
import { clientCommsSchema } from './model.js'
import { Schema } from 'mongoose'

const router = Router()

router.get('/', getAllClientComms)
router.get('/:ticket_id', getClientCommsForATicket)
router.post('/', body(clientCommsSchema.tree), insertClientComm)
router.post('/chat' , body({ticket_id:{type:Schema.Types.String , required:true} , 
                            fix_steps_id:{type:Schema.Types.String} , 
                            troubleshooting_id:{type:Schema.Types.String}}) , generateComms)

export default router
