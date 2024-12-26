"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleapis_1 = require("googleapis");
const _1 = require(".");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/google", (req, res) => {
    const url = _1.oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: _1.scopes,
    });
    res.json({ url });
});
const getTokenByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokens } = yield _1.oauth2Client.getToken(code);
    _1.oauth2Client.setCredentials(tokens);
    const oauth2 = googleapis_1.google.oauth2({ auth: _1.oauth2Client, version: "v2" });
    const userInfo = yield oauth2.userinfo.get();
    console.log("user", userInfo.data);
    return userInfo.data;
});
router.get("/google/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.query;
        if (!code) {
            return console.error("code is required");
        }
        const data = yield getTokenByCode(code);
        if (!data) {
            return res.status(401).json({ msg: "Unauthorized" });
        }
        const userExists = yield prisma.user.findFirst({
            where: {
                email: data.email,
            },
        });
        if (userExists) {
            return res.status(400).json({ msg: "user already exists" });
        }
        const realData = yield prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                image: data.picture,
            },
        });
        return res.json({ msg: "auth success", realData });
    }
    catch (e) {
        console.error("error", e);
        return res.status(500).json({ msg: "Internal server error" });
    }
}));
exports.default = router;
