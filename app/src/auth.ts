import { Request, Response, Router } from "express";
import { google } from "googleapis";
import { oauth2Client, scopes } from ".";
import { PrismaClient } from "@prisma/client";

const router = Router();

const prisma = new PrismaClient();

router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  res.json({ url });
});

const getTokenByCode = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
};

router.get(
  "/google/callback",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { code } = req.query;

      if (!code) {
        return console.error("code is required");
      }
      const data = await getTokenByCode(code as string);

      if (!data) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const userExists = await prisma.user.findFirst({
        where: {
          email: data.email,
        },
      });

      if (userExists) {
        return res.status(400).json({ msg: "user already exists" });
      }

      const realData = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.picture,
        },
      });

      return res.json({ msg: "auth success", realData });
    } catch (e) {
      console.error("error", e);
      return res.status(500).json({ msg: "Internal server error" });
    }
  }
);

export default router;
