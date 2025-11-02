import { Router } from 'express'
import { getAllFixSteps, insertFixSteps, getFixStepsForATicket , getFix_Steps } from './controller.js'
import { middleware as body } from 'bodymen'
import { fixStepsSchema } from './model.js'

const router = Router()

router.get('/', getAllFixSteps)
router.get('/:ticket_id', getFixStepsForATicket)
router.post('/', body(fixStepsSchema.tree), insertFixSteps)
router.get('/chat/:id' , getFix_Steps)

export default router
