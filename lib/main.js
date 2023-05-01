"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const run_1 = __importDefault(require("./run"));
const configs_1 = require("./configs");
(0, run_1.default)(configs_1.DEFAULT_INPUTS, "package.json", "CHANGELOG.md");
//# sourceMappingURL=main.js.map