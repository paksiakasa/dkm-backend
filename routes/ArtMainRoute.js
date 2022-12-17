import express from "express";
import { getArtMain, getArtMainById} from "../controllers/ArtMain.js";

const router = express.Router();

router.get('/artsmain', getArtMain);
router.get('/artsmain/:id' , getArtMainById);


export default router;