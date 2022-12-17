import express from "express";
import {getArts, getArtById, createArt, updateArt, deleteArt } from "../controllers/Arts.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/arts', verifyUser, getArts);
router.get('/arts/:id', verifyUser, getArtById);
router.post('/arts', verifyUser, createArt);
router.patch('/arts/:id', verifyUser, updateArt);
router.delete('/arts/:id', verifyUser, deleteArt);

export default router;