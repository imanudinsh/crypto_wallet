import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CreateUserSchema } from "../validator/user.validator";
import {
  handlePrismaError,
  isDev,
  sendErrorResponse,
  sendSuccessResponse,
} from "../utility";
import { verifyPersonalSign } from "../web3Utilities";
import { sign } from "jsonwebtoken";
import Moralis from "moralis";

const prisma = new PrismaClient();

Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

const getMediaType = (extension: string) => {
  if (
    extension.includes("png") ||
    extension.includes("jpg") ||
    extension.includes("jpeg") ||
    extension.includes("webp") ||
    extension.includes("gif")
  ) {
    return "image";
  }
  if (
    extension.includes("mp4") ||
    extension.includes("mkv") ||
    extension.includes("mov") ||
    extension.includes("avi")
  ) {
    return "video";
  }
  return "file";
};

export const UserController = {
  createUser: async (req: Request, res: Response) => {
    try {
      const { address, hash, message } = req.body as CreateUserSchema;
      const isValid = verifyPersonalSign({ message, hash, address });
      if (!isValid) {
        return sendErrorResponse(res, "Authentication error", 400);
      }
      const existingUser = await prisma.user.findFirst({
        where: { address: { equals: address } },
      });
      if (isDev()) {
        console.log(existingUser);
      }

      if (existingUser) {
        return await UserController.loginUser(req, res);
      }
      const user = await prisma.user.create({ data: { address } });
      const token = sign(user, process.env.SECRET!);

      return sendSuccessResponse(res, {
        ...user,
        token: token,
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },
  addAccount: async (req: Request, res: Response) => {
    try {
      const { address: mainAddress } = (req as any).user;
      const { address, hash, message } = req.body as CreateUserSchema;
      const isValid = verifyPersonalSign({ message, hash, address });
      if (!isValid) {
        return sendErrorResponse(res, "Authentication error", 400);
      }
      const user = await prisma.user.findFirst({
        where: { address: { equals: mainAddress, mode: "insensitive" } },
      });
      if (user) {
        const alreadyExist = user.subAddress.find(
          (_address) => _address === address
        );
        const isMainAddress =
          mainAddress.toLowerCase() === address.toLowerCase();
        if (!alreadyExist && !isMainAddress) {
          user.subAddress.push(address);
        }
        const updatedUser = await prisma.user.update({
          where: { address: user!.address },
          data: user!,
        });
        return sendSuccessResponse(res, {
          ...updatedUser,
        });
      }
      return sendErrorResponse(res, "Something went wrong", 400);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },
  backedUp: async (req: Request, res: Response) => {
    try {
      const { address } = (req as any).user;
      const user = await prisma.user.findFirst({
        where: { address: { equals: address, mode: "insensitive" } },
      });
      if (user) {
        user.seedPhraseBackedUp = true;
        const updatedUser = await prisma.user.update({
          where: { address: user!.address },
          data: user,
        });
        return sendSuccessResponse(res, {
          ...updatedUser,
        });
      }
      return sendErrorResponse(res, "Something went wrong", 400);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },
  loginUser: async (req: Request, res: Response) => {
    try {
      const { address, hash, message } = req.body as CreateUserSchema;
      const isValid = verifyPersonalSign({ message, hash, address });
      if (!isValid) {
        return sendErrorResponse(res, "Authentication error", 400);
      }
      const user = await prisma.user.findFirst({ where: { address } });

      if (user) {
        const token = sign(user, process.env.SECRET!);
        if (isDev()) {
          console.log("SIGNING WITH ===> ", process.env.SECRET);
          console.log("USER TOKEN====> ", token);
        }

        return sendSuccessResponse(res, {
          ...user,
          token,
        });
      }
      return sendErrorResponse(res, "Wallet not found", 404);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },
  uploadAttachment: async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "Please upload file" });
      }
      const fileNamePart = file.path.split(".");
      const mediaType = getMediaType(fileNamePart[fileNamePart.length - 1]);
      return sendSuccessResponse(res, {
        url: `${req.protocol}://${req.headers.host}/${file.path}`,
        fileName: file.filename,
        mediaType: mediaType,
      });
    } catch (error: any) {
      return res.status(400).send({ message: error.toString() });
    }
  },
  getFeePercentage: async (req: Request, res: Response) => {
    try {
      const siteSettings = await prisma.appSetting.findFirst();
      return sendSuccessResponse(res, {
        fee: siteSettings?.fee,
        adminAddress: siteSettings?.adminAddress,
      });
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  settings: async (req: Request, res: Response) => {
    try {
      const siteSettings = await prisma.appSetting.findFirst();
      return sendSuccessResponse(res, {
        helpUrl: siteSettings?.helpUrl,
        tcUrl: siteSettings?.termsAndConditionUrl,
        ppUrl: siteSettings?.privacyPolicyUrl,
        about: siteSettings?.aboutUs,
      });
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  tokens: async (req: Request, res: Response) => {
    try {
      const { address, chainId } = req.params;

      const tokens = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
        address: address,
        chain: chainId,
      });
      if (isDev()) {
        console.log(JSON.stringify(tokens, null, 4));
      }
      return sendSuccessResponse(res, [...tokens.result]);
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  tokenTransaction: async (req: Request, res: Response) => {
    try {
      const { address, tokenAddress, chainId } = req.params;

      const transfers = await Moralis.EvmApi.token.getWalletTokenTransfers({
        address: address,
        chain: chainId,
        contractAddresses: [tokenAddress],
      });
      if (isDev()) {
        console.log(JSON.stringify(transfers, null, 4));
      }

      return sendSuccessResponse(res, transfers.result);
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  walletTransaction: async (req: Request, res: Response) => {
    try {
      const { address, tokenAddress, chainId } = req.params;

      const activities = await Moralis.EvmApi.transaction.getWalletTransactions(
        {
          address: address,
          chain: chainId,
          limit: 100,
        }
      );
      if (isDev()) {
        console.log(JSON.stringify(activities, null, 4));
      }

      return sendSuccessResponse(res, activities.result);
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  deleteUser: async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      await prisma.user.delete({ where: { address: address } });
      return sendSuccessResponse(res, "User deleted successfully");
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },
};
