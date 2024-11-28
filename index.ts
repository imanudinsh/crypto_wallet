import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { AdminRouter } from "./src/routes/admin/AdminRoute";
import { UserRouter } from "./src/routes/user/UserRoute";
import { initMessaging } from "./src/messaging";

const prisma = new PrismaClient();

require("dotenv").config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*", allowedHeaders: ["Authorization"] },
  transports: ["websocket"],
});

initMessaging();

app.use("/uploads", express.static("uploads"));

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (err: any, req: any, res: any, next: any) {
  res.send({ message: err.toString() });
  res.end();
});

prisma.appSetting.findMany().then(async (siteSettings: any) => {
  if (siteSettings.length === 0) {
    await prisma.appSetting.create({
      data: {
        helpUrl: "https://support.metamask.io/hc/en-us",
        privacyPolicyUrl: "https://metamask.io/privacy-policy/",
        termsAndConditionUrl: "https://metamask.io/terms-of-use/",
        aboutUs: "https://metamask.io/about/",
        fee: 10,
        adminAddress: "0xC593125f74EBd1452720090e78e368858cFbaA46",
      },
    });
  }
  app.use("/api/admin", AdminRouter);
  app.use("/api/user", UserRouter);

  server.listen(process.env.BACKEND_PORT, () => {
    console.log(`LISTENTING ON PORT ${process.env.BACKEND_PORT}`);
  });
});
