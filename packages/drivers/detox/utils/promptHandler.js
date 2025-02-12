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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
class PromptHandler {
    uploadImage(imagePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield fs_1.promises.readFile(imagePath);
            try {
                const response = yield axios_1.default.post("https://bo.wix.com/mobile-infra-ai-services/v1/image-upload", {
                    image,
                });
                const imageUrl = response.data.url;
                if (!imageUrl) {
                    throw new Error(`Cannot find uploaded URL, got response: ${JSON.stringify(response.data)}`);
                }
                return imageUrl;
            }
            catch (error) {
                console.error("Error while uploading image:", error);
                throw error;
            }
        });
    }
    runPrompt(prompt, imagePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!imagePath) {
                try {
                    const response = yield axios_1.default.post("https://bo.wix.com/mobile-infra-ai-services/v1/prompt", {
                        prompt,
                        model: "SONNET_3_5",
                        ownershipTag: "Detox OSS",
                        project: "Detox OSS",
                        images: [],
                    });
                    const generatedText = response.data.generatedTexts[0];
                    if (!generatedText) {
                        throw new Error(`Failed to generate text, got response: ${JSON.stringify(response.data)}`);
                    }
                    return generatedText;
                }
                catch (error) {
                    console.error("Error running prompt:", error);
                    throw error;
                }
            }
            const imageUrl = yield this.uploadImage(imagePath);
            try {
                const response = yield axios_1.default.post("https://bo.wix.com/mobile-infra-ai-services/v1/prompt", {
                    prompt,
                    model: "SONNET_3_5",
                    ownershipTag: "Detox OSS",
                    project: "Detox OSS",
                    images: [imageUrl],
                });
                const generatedText = response.data.generatedTexts[0];
                if (!generatedText) {
                    throw new Error(`Failed to generate text, got response: ${JSON.stringify(response.data)}`);
                }
                return generatedText;
            }
            catch (error) {
                console.error("Error running prompt:", error);
                throw error;
            }
        });
    }
    isSnapshotImageSupported() {
        return true;
    }
}
exports.PromptHandler = PromptHandler;
