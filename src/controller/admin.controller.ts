import { Prisma, PrismaClient } from "@prisma/client";
import {
  handlePrismaError,
  sendErrorResponse,
  sendSuccessResponse,
} from "../utility";
import { CreateUserSchema } from "../validator/user.validator";
import { verifyPersonalSign } from "../web3Utilities";
import { LoginAdminSchema } from "../validator/admin.validator";
import { Request, Response } from "express";
import bycrpt from "bcrypt";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

type Settings = {
  helpUrl?: string;
  privacyPolicyUrl?: string;
  termsAndConditionUrl?: string;
  about?: string;
  fee?: number;
};
export const AdminController = {
  createUser: async (req: Request, res: Response) => {
    try {
      const { username, password, secret } = req.body;
      if (process.env["SECRET"] === secret) {
        const hashedPassword = await bycrpt.hash(password, 10);
        const user = await prisma.admin.create({
          data: { username, password: hashedPassword },
        });
        return sendSuccessResponse(res, {
          ...user,
        });
      }
      return sendErrorResponse(res, "Not authenticated");
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },
  loginAdmin: async (req: Request, res: Response) => {
    const { username, password } = req.body as unknown as LoginAdminSchema;
    const admin = await prisma.admin.findFirst({
      where: { username: username },
    });
    if (!admin) {
      return sendErrorResponse(res, "Username or password invalid", 400);
    }
    const isValid = await bycrpt.compare(password, admin.password);
    if (!isValid) {
      return sendErrorResponse(res, "Username or password invalid", 400);
    }
    const token = sign(
      { ...admin, password: undefined },
      process.env.SECRET as any
    );
    return sendSuccessResponse(res, token, 200);
  },
  users: async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return sendSuccessResponse(res, users, 200);
  },
  deactivateUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isDeactivated: true },
    });
    return sendSuccessResponse(res, users, 200);
  },
  activateUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isDeactivated: false },
    });
    return sendSuccessResponse(res, users, 200);
  },
  blockUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isTransactionBlocked: true },
    });
    return sendSuccessResponse(res, users, 200);
  },
  unblockUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isTransactionBlocked: false },
    });
    return sendSuccessResponse(res, users, 200);
  },
  getConversations: async (req: Request, res: Response) => {
    let groupedMessagesByForId: any;
    const messages = await prisma.message.findMany({
      distinct: ["forId"],
      orderBy: {
        timestamp: "desc",
      },
      include: {
        for: true, // Include sender information,
        attachment: true,
      },
    });
    messages.reverse();
    groupedMessagesByForId = messages.reduce((acc, message) => {
      const {
        for: { address },
      } = message;
      if (!acc[address]) {
        acc[address] = message;
      }
      return acc;
    }, {} as Record<string, (typeof messages)[0]>);
    return sendSuccessResponse(res, groupedMessagesByForId, 200);
  },
  updateSettings: async (req: Request, res: Response) => {
    const updateSettings = req.body as Settings;
    try {
      const appSetting = await prisma.appSetting.findFirst();
      const settings = await prisma.appSetting.update({
        where: { id: appSetting?.id },
        data: updateSettings,
      });
      return sendSuccessResponse(res, settings, 200);
    } catch (error: any) {
      return res.status(400).send({ message: error.toString() });
    }
  },
  settings: async (req: Request, res: Response) => {
    try {
      const appSetting = await prisma.appSetting.findFirst();

      return sendSuccessResponse(res, appSetting, 200);
    } catch (error: any) {
      return res.status(400).send({ message: error.toString() });
    }
  },
  getConversationsWithoutRequest: async () => {
    let groupedMessagesByForId: any;
    const messages = await prisma.message.findMany({
      distinct: ["forId"],
      orderBy: {
        timestamp: "desc",
      },
      include: {
        for: true,
        attachment: true,
      },
    });
    groupedMessagesByForId = messages.reduce((acc, message) => {
      const {
        for: { address },
      } = message;
      acc[address] = message;
      return acc;
    }, {} as Record<string, (typeof messages)[0]>);
    return groupedMessagesByForId;
  },
  getChatWithoutRequest: async (forId: number) => {
    const messages = await prisma.message.findMany({
      where: { forId: forId },
      orderBy: {
        timestamp: "desc",
      },
      include: {
        for: true,
        attachment: true,
      },
    });
    return messages;
  },
  markAsChatRead: async (forId: number) => {
    await prisma.message.updateMany({
      where: { forId: forId },
      data: { seen: true },
    });
  },
  deleteConversation: async (req: Request, res: Response) => {
    await prisma.message.deleteMany();

    return sendSuccessResponse(res, null, 200);
  },
};
