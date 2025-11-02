import { Router } from 'express'
import user from './user'
import auth from './auth'
import tickets from './tickets'
import suggestions from './suggestions'
import resolutions from './resolution'
import fix_steps from './fix-steps'
import client_coms from './client-comms'
const router = new Router()

/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */
router.use('/users', user)
router.use('/auth', auth)
router.use('/tickets', tickets)
router.use('/suggestions', suggestions)
router.use('/resolutions',resolutions)
router.use('/fix-steps' , fix_steps)
router.use('/client-coms' , client_coms)
export default router
