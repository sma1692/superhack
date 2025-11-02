import { Router } from "express";
import { getAllTickets , insertTicker , getTicket} from "./controller";
import { middleware as body } from 'bodymen'
import { ticketSchema } from "./model";
const router = Router()


router.get('/:id' , getTicket)
router.get('/' , getAllTickets) 
router.post('/' , body(ticketSchema.tree) ,insertTicker) 



export default router