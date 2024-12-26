import express from "express";
import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";
import router from "./auth";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

app.use("/auth", router);

app.listen(3000, () => {
  console.log("server is running at 3000");
});

export { oauth2Client, scopes };
