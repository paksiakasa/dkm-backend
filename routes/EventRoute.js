import express from "express";
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from "../controllers/Events.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/events', verifyUser, getEvents);
router.get('/events/:id', verifyUser, getEventById);
router.post('/events', verifyUser, createEvent);
router.patch('/events/:id', verifyUser, updateEvent);
router.delete('/events/:id', verifyUser, deleteEvent);

export default router;