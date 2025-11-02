import { Router } from 'express'
import { getAllSuggestions, insertSuggestion ,getSuggestionsForATicket , getTroubleShooting} from './controller'
import { middleware as body } from 'bodymen'
import { suggestionSchema } from './model'

const router = Router()

router.get('/', getAllSuggestions)
router.get('/:ticket_id' , getSuggestionsForATicket)
router.post('/', body(suggestionSchema.tree), insertSuggestion)
router.get('/chat/:id' , getTroubleShooting)

export default router
