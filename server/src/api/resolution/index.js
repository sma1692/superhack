import { Router } from 'express'
import { getAllResolutions, insertResolution, getResolutionsForATicket , generateResolution } from './controller.js'
import { middleware as body } from 'bodymen'
import { resolutionSchema } from './model.js'
import { Schema } from 'mongoose'

const router = Router()

router.get('/', getAllResolutions)
router.get('/:ticket_id', getResolutionsForATicket)
router.post('/', body(resolutionSchema.tree), insertResolution)
router.post('/chat' ,  body({ticket_id:{type:Schema.Types.String , required:true} , 
                            fix_steps_id:{type:Schema.Types.String} , 
                            troubleshooting_id:{type:Schema.Types.String}}) , generateResolution)

export default router
