import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js"; //kurang ArtRoute&EVENT
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import MerchRoute from "./routes/MerchRoute.js";
import AuthRoute from "./routes/AuthRoute.js";

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});

(async()=>{
    await db.sync();
})();


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}))

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(UserRoute);
app.use(MerchRoute);
app.use(AuthRoute);

store.sync();

app.listen(process.env.APP_PORT, ()=>{
    console.log('Server up and running...');
});