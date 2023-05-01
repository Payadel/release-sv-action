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
exports.createPullRequest = void 0;
const utility_1 = require("./utility");
const git_1 = require("./git");
function createPullRequest(createPrForBranchName, body) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, git_1.getCurrentBranchName)()
            .then(currentBranchName => createOrUpdatePr(createPrForBranchName, currentBranchName, body))
            .then(output => getPrLink(output.stdout, `Failed to extract pull request URL from command output.\nOutput: ${output.stdout}`));
    });
}
exports.createPullRequest = createPullRequest;
function createOrUpdatePr(createPrForBranchName, currentBranchName, body) {
    createPrForBranchName = encodeDoubleQuotation(createPrForBranchName);
    currentBranchName = encodeDoubleQuotation(currentBranchName);
    body = encodeDoubleQuotation(body);
    return (0, utility_1.execCommand)(`gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`, `Create pull request from ${currentBranchName} to ${createPrForBranchName} with title 'Merge ${currentBranchName} into ${createPrForBranchName}' failed.`).catch(e => {
        const message = e instanceof Error ? e.message : e.toString();
        if (message.toLowerCase().includes("already exists")) {
            return getPrLink(message, `I tried to make a pull request from ${currentBranchName} to ${createPrForBranchName} but it didn't work. It seems that this pull request exists. I tried to find the link in the message, but I didn't succeed.`).then(prLink => updatePr(prLink, body));
        }
        throw e;
    });
}
function getPrLink(str, errorMessage) {
    return new Promise((resolve, reject) => {
        const regex = /(https*:\/\/)?github\.com\/\S+\/\S+\/pull\/\d+/;
        const urlMatch = str.match(regex);
        return urlMatch
            ? resolve(urlMatch[0])
            : reject(errorMessage ? new Error(errorMessage) : undefined);
    });
}
function updatePr(prLinkOrNumber, body) {
    prLinkOrNumber = encodeDoubleQuotation(prLinkOrNumber);
    body = encodeDoubleQuotation(body);
    return (0, utility_1.execCommand)(`gh pr edit "${prLinkOrNumber}" --body "${body}"`, `Update pull request '${prLinkOrNumber}' failed.`);
}
function encodeDoubleQuotation(text) {
    return text.replace(/"/g, '"');
}
//# sourceMappingURL=prHelper.js.map