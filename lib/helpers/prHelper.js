"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPullRequest = void 0;
const core = __importStar(require("@actions/core"));
const utility_1 = require("./utility");
const git_1 = require("./git");
function createPullRequest(createPrForBranchName, body, testMode = false) {
    return (0, git_1.getCurrentBranchName)()
        .then(currentBranchName => createOrUpdatePr(createPrForBranchName, currentBranchName, body, testMode))
        .then(output => getPrLink(output.stdout, `Failed to extract pull request URL from command output.\nOutput: ${output.stdout}\n${output.stderr}`));
}
exports.createPullRequest = createPullRequest;
function createOrUpdatePr(createPrForBranchName, currentBranchName, body, testMode = false) {
    createPrForBranchName = encodeDoubleQuotation(createPrForBranchName);
    currentBranchName = encodeDoubleQuotation(currentBranchName);
    body = encodeDoubleQuotation(body);
    const command = `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`;
    if (testMode) {
        core.info(`The test mode is enabled so skipping create pull request and return fake output. Command: ${command}`);
        return Promise.resolve({
            stdout: `Creating pull request for ${currentBranchName} into ${createPrForBranchName} in user/repo\nhttps://github.com/user/repo/pull/1000`,
            exitCode: 0,
            stderr: "",
        });
    }
    return (0, utility_1.execCommand)(command, `Create pull request from ${currentBranchName} to ${createPrForBranchName} with title 'Merge ${currentBranchName} into ${createPrForBranchName}' failed.`, [], {
        silent: true,
        ignoreReturnCode: true,
    }).then(output => {
        if (output.exitCode === 0)
            return output;
        const message = `${output.stdout}\n${output.stderr}`;
        if (message.toLowerCase().includes("already exists")) {
            return getPrLink(message, `I tried to make a pull request from ${currentBranchName} to ${createPrForBranchName} but it didn't work. It seems that this pull request exists. I tried to find the link in the message, but I didn't succeed.\nMain message: ${message}`).then(prLink => updatePr(prLink, body));
        }
        throw new Error(message);
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
    return (0, utility_1.execCommand)(`gh pr edit "${prLinkOrNumber}" --body "${body}"`, `Update pull request '${prLinkOrNumber}' failed.`, [], { silent: true });
}
function encodeDoubleQuotation(text) {
    return text.replace(/"/g, '"');
}
//# sourceMappingURL=prHelper.js.map