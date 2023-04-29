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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.svRelease = exports.installStandardVersionPackage = exports.setGitConfigs = exports.operateWhen = exports.createReleaseFile = exports.push = exports.execCommand = exports.execBashCommand = exports.getBooleanInputOrDefault = exports.getInputOrDefault = exports.getCurrentBranchName = void 0;
const exec = __importStar(require("@actions/exec"));
const core = __importStar(require("@actions/core"));
const path_1 = __importDefault(require("path"));
function getCurrentBranchName() {
    return execCommand("git rev-parse --abbrev-ref HEAD", "Detect current branch name failed.").then(result => result.stdout.trim());
}
exports.getCurrentBranchName = getCurrentBranchName;
function getInputOrDefault(name, default_value = "", trimWhitespace = true, required = false) {
    const input = core.getInput(name, {
        trimWhitespace,
        required,
    });
    if (!input || input === "")
        return default_value;
    return input;
}
exports.getInputOrDefault = getInputOrDefault;
function getBooleanInputOrDefault(name, defaultValue, required = false) {
    const input = getInputOrDefault(name, "", true, required).toLowerCase();
    if (input === "")
        return defaultValue;
    if (input === "true")
        return true;
    if (input === "false")
        return false;
    throw new TypeError(`The value of ${name} is not valid. It must be either true or false but got ${input}`);
}
exports.getBooleanInputOrDefault = getBooleanInputOrDefault;
function execBashCommand(command, errorMessage = null) {
    command = command.replace(/"/g, "'");
    return execCommand(`/bin/bash -c "${command}"`, errorMessage);
}
exports.execBashCommand = execBashCommand;
function execCommand(command, errorMessage = null) {
    return exec.getExecOutput(command).catch(error => {
        const title = errorMessage || `Execute '${command}' failed.`;
        const message = error instanceof Error ? error.message : error.toString();
        throw new Error(`${title}\n${message}`);
    });
}
exports.execCommand = execCommand;
function push() {
    return getCurrentBranchName().then(currentBranchName => execCommand(`git push --follow-tags origin ${currentBranchName}`));
}
exports.push = push;
function createReleaseFile(releaseDir, releaseFilename) {
    if (!releaseFilename.endsWith(".zip"))
        releaseFilename += ".zip";
    return getGitRootDir().then(rootDir => {
        const outputPath = path_1.default.join(rootDir, releaseFilename);
        return execBashCommand(`(cd ${releaseDir}; zip -r ${outputPath} .)`, `Can not create release file from ${releaseDir} to ${outputPath}'.`).then(() => releaseFilename);
    });
}
exports.createReleaseFile = createReleaseFile;
function getGitRootDir() {
    return execCommand("git rev-parse --show-toplevel", "find git root directory failed.").then(output => output.stdout.trim());
}
function operateWhen(condition, func, elseMessage = null) {
    if (condition)
        return func();
    else if (elseMessage)
        core.info(elseMessage);
}
exports.operateWhen = operateWhen;
function setGitConfigs(email, username) {
    return execCommand(`git config --global user.email "${email}"`).then(() => execCommand(`git config --global user.name "${username}"`));
}
exports.setGitConfigs = setGitConfigs;
function installStandardVersionPackage() {
    return execCommand("npm install -g standard-version", "Can not install standard version npm package.");
}
exports.installStandardVersionPackage = installStandardVersionPackage;
function svRelease(version, skipChangelog) {
    let releaseCommand = "standard-version";
    if (version)
        releaseCommand += ` --release-as ${version}`;
    if (skipChangelog)
        releaseCommand += " --skip.changelog";
    return execCommand(releaseCommand);
}
exports.svRelease = svRelease;
//# sourceMappingURL=utility.js.map