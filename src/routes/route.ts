import express, { Router } from 'express';
const router: Router = express.Router();

import * as events from "../controller/events"


router.get('/events', events.getAllEvents)
router.get('/events/:id/availability', events.getEventDetail)
router.post('/events', events.createEvent)
router.post('/events/:id/purchase', events.purchaseTickets)
router.post('/events/:id/lock', events?.lockSeat);


export { router }