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
exports.isBranchNameExistsInRemote = exports.isBranchNameExistsInLocal = exports.ensureBranchNameIsValid = exports.push = exports.setGitConfigs = exports.getGitRootDir = exports.getCurrentBranchName = void 0;
const utility_1 = require("./utility");
const core = __importStar(require("@actions/core"));
function getCurrentBranchName() {
    return (0, utility_1.execCommand)("git rev-parse --abbrev-ref HEAD", "Detect current branch name failed.").then(result => result.stdout.trim());
}
exports.getCurrentBranchName = getCurrentBranchName;
function getGitRootDir() {
    return (0, utility_1.execCommand)("git rev-parse --show-toplevel", "find git root directory failed.").then(output => output.stdout.trim());
}
exports.getGitRootDir = getGitRootDir;
function setGitConfigs(email, username) {
    return (0, utility_1.execCommand)(`git config --global user.email "${email}"`).then(() => (0, utility_1.execCommand)(`git config --global user.name "${username}"`));
}
exports.setGitConfigs = setGitConfigs;
function push(testMode = false) {
    return getCurrentBranchName().then(currentBranchName => {
        const command = `git push --follow-tags origin ${currentBranchName}`;
        if (testMode) {
            core.info(`Test mode is enabled so skipping push command and return fake output. Command: ${command}`);
            return Promise.resolve({
                stdout: "OK!",
                stderr: "",
                exitCode: 0,
            });
        }
        return (0, utility_1.execCommand)(command);
    });
}
exports.push = push;
function ensureBranchNameIsValid(branchName) {
    return isBranchNameExistsInLocal(branchName).then(isExistInLocal => {
        if (isExistInLocal)
            return;
        return isBranchNameExistsInRemote(branchName).then(isExistInRemote => {
            if (isExistInRemote)
                return;
            throw new Error(`The branch '${branchName}' is not valid.`);
        });
    });
}
exports.ensureBranchNameIsValid = ensureBranchNameIsValid;
function isBranchNameExistsInLocal(branchName) {
    return (0, utility_1.execCommand)(`git show-ref --verify refs/heads/${branchName}`, `Failed to check is branch '${branchName}' exists in local.`, [], { ignoreReturnCode: true }).then(output => {
        if (output.exitCode === 0)
            return true;
        const message = `${output.stderr}\n${output.stdout}`;
        if (message.toLowerCase().includes(" - not a valid ref"))
            return false;
        throw new Error(`An unknown error occurred.\n${message}`);
    });
}
exports.isBranchNameExistsInLocal = isBranchNameExistsInLocal;
function isBranchNameExistsInRemote(branchName) {
    return (0, utility_1.execCommand)(`git ls-remote --quiet --heads --exit-code origin ${branchName}`, `Failed to check is branch '${branchName}' exists in remote.`, [], { ignoreReturnCode: true }).then(output => {
        if (output.exitCode === 0)
            return true;
        if (output.exitCode === 2)
            return false;
        const message = `${output.stderr}\n${output.stdout}`;
        throw new Error(`An unknown error occurred.\n${message}`);
    });
}
exports.isBranchNameExistsInRemote = isBranchNameExistsInRemote;
//# sourceMappingURL=git.js.map