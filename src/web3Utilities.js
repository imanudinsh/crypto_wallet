"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPersonalSign = void 0;
const ethers_1 = require("ethers");
const utility_1 = require("./utility");
const verifyPersonalSign = ({ message, hash, address, }) => {
    const messageHash = (0, ethers_1.hashMessage)(message);
    try {
        const signerAddress = (0, ethers_1.recoverAddress)(messageHash, hash);
        if ((0, utility_1.isDev)()) {
            console.log("Signer address ===>", signerAddress);
        }
        if (signerAddress.toLowerCase() === address.toLowerCase()) {
            return true;
        }
        return false;
    }
    catch (error) {
        return false;
    }
};
exports.verifyPersonalSign = verifyPersonalSign;
