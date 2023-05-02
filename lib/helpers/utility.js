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
exports.getBooleanInputOrDefault = exports.getInputOrDefault = exports.createReleaseFile = exports.readFile = exports.execCommand = exports.execBashCommand = void 0;
const exec = __importStar(require("@actions/exec"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const git_1 = require("./git");
const core = __importStar(require("@actions/core"));
function execBashCommand(command, errorMessage, args, options) {
    command = command.replace(/"/g, "'");
    command = `/bin/bash -c "${command}"`;
    core.debug(`Execute command: ${command}`);
    return execCommand(command, errorMessage, args, options);
}
exports.execBashCommand = execBashCommand;
function execCommand(command, errorMessage, args, options) {
    core.debug(`Execute command: ${command}`);
    return exec.getExecOutput(command, args, options).catch(error => {
        const title = errorMessage || `Execute '${command}' failed.`;
        const message = error instanceof Error ? error.message : error.toString();
        throw new Error(`${title}\n${message}`);
    });
}
exports.execCommand = execCommand;
function readFile(fileName) {
    return new Promise((resolve, reject) => {
        core.debug(`Reading file: ${fileName}`);
        if (!fs_1.default.existsSync(fileName)) {
            return reject(new Error(`Can not find '${fileName}'.`));
        }
        resolve(fs_1.default.readFileSync(fileName, "utf8").trim());
    });
}
exports.readFile = readFile;
function createReleaseFile(releaseDir, releaseFilename) {
    if (!releaseFilename.endsWith(".zip"))
        releaseFilename += ".zip";
    return (0, git_1.getGitRootDir)().then(rootDir => {
        const outputPath = path_1.default.join(rootDir, releaseFilename);
        return execBashCommand(`(cd ${releaseDir}; zip -r ${outputPath} .)`, `Can not create release file from '${releaseDir}' to '${outputPath}'.`).then(() => releaseFilename);
    });
}
exports.createReleaseFile = createReleaseFile;
function getInputOrDefault(name, default_value = undefined, trimWhitespace = true, required = false) {
    const input = core.getInput(name, {
        trimWhitespace,
        required,
    });
    if (!input || input === "") {
        core.debug(`${name}: ${input} (default value)`);
        return default_value;
    }
    core.debug(`${name}: ${input}`);
    return input;
}
exports.getInputOrDefault = getInputOrDefault;
function getBooleanInputOrDefault(name, defaultValue = undefined, required = false) {
    var _a;
    const input = (_a = getInputOrDefault(name, undefined, true, required)) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (!input)
        return defaultValue;
    if (input === "true")
        return true;
    if (input === "false")
        return false;
    throw new TypeError(`The value of '${name}' is not valid. It must be either true or false but got '${input}'.`);
}
exports.getBooleanInputOrDefault = getBooleanInputOrDefault;
//# sourceMappingURL=utility.js.map