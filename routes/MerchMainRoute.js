import express from "express";
import { getMerchMain, getMerchMainById} from "../controllers/MerchMain.js";

const router = express.Router();

router.get('/merchsmain', getMerchMain);
router.get('/merchsmain/:id' , getMerchMainById);


export default router;