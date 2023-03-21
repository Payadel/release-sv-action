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
exports.createPr = void 0;
const exec = __importStar(require("@actions/exec"));
const core = __importStar(require("@actions/core"));
const utility_1 = require("./utility");
function createPr(createPrForBranchName, isTestMode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!createPrForBranchName)
            return Promise.resolve(null);
        if (isTestMode) {
            core.info("Test mode is enable so skipping Create PR.");
            return Promise.resolve(null);
        }
        core.info("Create pull request...");
        return (0, utility_1.getCurrentBranchName)().then((currentBranchName) => __awaiter(this, void 0, void 0, function* () {
            return exec
                .getExecOutput(`gh pr create -B ${createPrForBranchName} -H ${currentBranchName} --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body-file CHANGELOG.md`)
                .catch(e => {
                if (e.message.contains("already exists"))
                    return updatePr(createPrForBranchName, currentBranchName);
                return e;
            });
        }));
    });
}
exports.createPr = createPr;
function updatePr(targetBranchName, currentBranchName) {
    return __awaiter(this, void 0, void 0, function* () {
        return findActivePr(targetBranchName, currentBranchName).then(prNumber => {
            if (!prNumber)
                throw new Error("Can not find any active pull request to edit.");
            return exec.getExecOutput(`gh pr edit ${prNumber} --body-file CHANGELOG.md`);
        });
    });
}
function findActivePr(targetBranchName, currentBranchName) {
    return __awaiter(this, void 0, void 0, function* () {
        return exec
            .getExecOutput(`gh pr list -B ${targetBranchName} -H ${currentBranchName} --state open --json number`)
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
    });
}
//# sourceMappingURL=prHelper.js.map