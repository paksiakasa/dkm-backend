import express from "express";
import { getEventMain, getEventMainById} from "../controllers/EventMain.js";

const router = express.Router();

router.get('/eventsmain', getEventMain);
router.get('/eventsmain/:id' , getEventMainById);


export default router;