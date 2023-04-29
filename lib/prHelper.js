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
const core = __importStar(require("@actions/core"));
const utility_1 = require("./utility");
function createPullRequest(createPrForBranchName) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, utility_1.getCurrentBranchName)()
            .then(currentBranchName => createOrUpdatePr(createPrForBranchName, currentBranchName))
            .then(output => {
            const link = getPrLink(output.stdout);
            if (!link)
                throw new Error(`Failed to extract pull request URL from command output.\nOutput: ${output.stdout}`);
            return link;
        });
    });
}
exports.createPullRequest = createPullRequest;
function createOrUpdatePr(createPrForBranchName, currentBranchName) {
    return (0, utility_1.execCommand)(`gh pr create -B ${createPrForBranchName} -H ${currentBranchName} --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body-file CHANGELOG.md`, `Create pull request from ${currentBranchName} to ${createPrForBranchName} with title 'Merge ${currentBranchName} into ${createPrForBranchName}' failed.`).catch(e => tryFindActivePr(createPrForBranchName, currentBranchName).then(prNumber => {
        if (!prNumber) {
            throw new Error(`Can not create pull request and can not find any active PR to update.\n${e.toString()}`);
        }
        core.info("Can not create pull request because it is exist. Try update it.");
        return updatePr(prNumber);
    }));
}
function getPrLink(str) {
    const regex = /(https*:\/\/)?github\.com\/\S+\/\S+\/pull\/\d+/;
    const urlMatch = str.match(regex);
    return urlMatch ? urlMatch[0] : null;
}
function updatePr(prNumber) {
    return (0, utility_1.execCommand)(`gh pr edit ${prNumber} --body-file CHANGELOG.md`, `Update pull request with '${prNumber}' failed.`);
}
function tryFindActivePr(targetBranchName, currentBranchName) {
    return (0, utility_1.execCommand)(`gh pr list -B ${targetBranchName} -H ${currentBranchName} --state open --json number`, `Trying to find active PR for ${targetBranchName} from ${currentBranchName} failed.`)
        .then(result => JSON.parse(result.stdout))
        .then((json) => {
        switch (json.length) {
            case 0:
                return null;
            case 1:
                return json[0].number.toString();
            default:
                throw new Error("More than one pull requests found.");
        }
    });
}
//# sourceMappingURL=prHelper.js.map