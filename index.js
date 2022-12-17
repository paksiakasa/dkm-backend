import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import MerchRoute from "./routes/MerchRoute.js";
import ArtRoute from "./routes/ArtRoute.js";
import EventRoute from "./routes/EventRoute.js"
import AuthRoute from "./routes/AuthRoute.js";
import MerchMainRoute from "./routes/MerchMainRoute.js";
import ArtMainRoute from "./routes/ArtMainRoute.js";
import EventMainRoute from "./routes/EventMainRoute.js";

dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
})); 

app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});

// (async()=>{
//     await db.sync();
// })();


app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}))


app.use(UserRoute);
app.use(MerchRoute);
app.use(MerchMainRoute)
app.use(ArtRoute);
app.use(ArtMainRoute);
app.use(EventRoute);
app.use(EventMainRoute);
app.use(AuthRoute);



// store.sync();

app.listen(process.env.APP_PORT, ()=>{
    console.log('Server up and running...');
});