import express from "express";
import {getMerchs, getMerchById, createMerch, updateMerch, deleteMerch } from "../controllers/Merchs.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/merchs', verifyUser, getMerchs);
router.get('/merchs/:id', verifyUser, getMerchById);
router.post('/merchs', verifyUser, createMerch);
router.patch('/merchs/:id', verifyUser, updateMerch);
router.delete('/merchs/:id', verifyUser, deleteMerch);

export default router;