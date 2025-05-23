import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// SETTINGS
app.use(express.json({limit:"16kb"}));  ///accept json
app.use(express.urlencoded({extended: true, limit: "16kb"}))   /// accept urlencoded // extended can give object inside object
app.use(express.static('public'));
app.use(cookieParser());

const app = express();

export { app };