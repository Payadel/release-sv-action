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
exports.execBashCommand = exports.getCurrentBranchName = exports.getBooleanInputOrDefault = exports.getInputOrDefault = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
function getInputOrDefault(name, defaultValue, isTestMode) {
    var _a;
    let input = (_a = core.getInput(name)) !== null && _a !== void 0 ? _a : defaultValue;
    if (input === "")
        input = defaultValue;
    core.info(`${name}: ${input}`);
    if (isTestMode)
        core.setOutput(name, input);
    return input;
}
exports.getInputOrDefault = getInputOrDefault;
function getBooleanInputOrDefault(name, defaultValue, isTestMode) {
    var _a;
    const input = (_a = core.getBooleanInput(name)) !== null && _a !== void 0 ? _a : defaultValue;
    core.info(`${name}: ${input}`);
    if (isTestMode)
        core.setOutput(name, input);
    return input;
}
exports.getBooleanInputOrDefault = getBooleanInputOrDefault;
function getCurrentBranchName() {
    return __awaiter(this, void 0, void 0, function* () {
        return exec
            .getExecOutput("git rev-parse --abbrev-ref HEAD")
            .then(result => result.stdout.trim());
    });
}
exports.getCurrentBranchName = getCurrentBranchName;
function execBashCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        return exec.getExecOutput(`/bin/bash -c "${command}"`);
    });
}
exports.execBashCommand = execBashCommand;
//# sourceMappingURL=utility.js.map