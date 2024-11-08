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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewestChangelogVersion = exports.isNeedGenerateChangelog = exports.getChangelogHeaders = exports.readChangelogSection = exports.DEFAULT_CHANGELOG_VERSION_REGEX = exports.DEFAULT_CHANGELOG_HEADER_REGEX = void 0;
const utility_1 = require("./utility");
const version_1 = require("./version");
const core = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
exports.DEFAULT_CHANGELOG_HEADER_REGEX = new RegExp("#+( )+((\\[[^\\]]+]\\([^)]+\\))|[^ ]+)( )+\\([^)]+\\)");
exports.DEFAULT_CHANGELOG_VERSION_REGEX = new RegExp("(?:[[^]]*]|)s*([a-zA-Z0-9.]+)");
function readChangelogSection(changelog_file, targetVersion, changelogHeaderRegex) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield (0, utility_1.readFile)(changelog_file);
        const lines = content.split("\n");
        core.debug(`The ${changelog_file} has ${lines.length} lines.`);
        changelogHeaderRegex =
            changelogHeaderRegex || exports.DEFAULT_CHANGELOG_HEADER_REGEX;
        core.debug(`Regex: ${changelogHeaderRegex.source}`);
        const headerLines = getChangelogHeaders(lines, undefined, changelogHeaderRegex);
        let targetIndex;
        if (targetVersion) {
            core.debug(`Target version is ${targetVersion}. Try find target index.`);
            // Find target header (with specific version)
            targetIndex = headerLines.findIndex(line => new RegExp(`\\b${targetVersion.toLowerCase()}\\b`).test(line.line));
            if (targetIndex < 0) {
                throw new Error(`Can not find or detect any changelog with version ${targetVersion}.\n` +
                    "You can update regex or report this issue with details.");
            }
            core.debug(`Target index: ${targetIndex}`);
        }
        else {
            core.debug(`The targetVersion is not provided. So consider 0 as target index.`);
            targetIndex = 0;
        }
        const startLineIndex = headerLines[targetIndex].index;
        const endLineIndex = targetIndex + 1 < headerLines.length
            ? headerLines[targetIndex + 1].index
            : lines.length;
        core.debug(`Slice from ${startLineIndex} to ${endLineIndex}`);
        return lines.slice(startLineIndex, endLineIndex).join("\n");
    });
}
exports.readChangelogSection = readChangelogSection;
function getChangelogHeaders(lines, limit, changelogHeaderRegex) {
    core.debug(`Try find changelog headers from ${lines.length} lines with limit ${limit}`);
    const headerLines = [];
    changelogHeaderRegex =
        changelogHeaderRegex || exports.DEFAULT_CHANGELOG_HEADER_REGEX;
    core.debug(`Regex is: ${changelogHeaderRegex.source}`);
    for (let i = 0; i < lines.length; i++) {
        if (!changelogHeaderRegex.test(lines[i]))
            continue;
        headerLines.push({ line: lines[i], index: i });
        if (limit && headerLines.length >= limit)
            return headerLines;
    }
    if (headerLines.length === 0) {
        throw new Error("Can not find or detect any changelog header.\n" +
            `Current regex: ${changelogHeaderRegex.source}\n` +
            `Test on ${lines.length} lines.\n` +
            "You can update regex or report this issue with details.");
    }
    return headerLines;
}
exports.getChangelogHeaders = getChangelogHeaders;
function isNeedGenerateChangelog(generateChangelogOption, changelog_file, inputVersion, changelogHeaderRegex, changelogVersionRegex) {
    return new Promise((resolve, reject) => {
        switch (generateChangelogOption) {
            case "never":
                core.info("generate-changelog is set to 'never' so skipping generate changelog.");
                return resolve(false);
            case "always":
                core.info("generate-changelog is set to 'always' so trying to generate changelog.");
                return resolve(true);
            case "auto":
                changelogHeaderRegex =
                    changelogHeaderRegex || exports.DEFAULT_CHANGELOG_HEADER_REGEX;
                changelogVersionRegex =
                    changelogVersionRegex || exports.DEFAULT_CHANGELOG_VERSION_REGEX;
                return autoDetectIsNeedGenerateChangelog(changelog_file, changelogHeaderRegex, changelogVersionRegex, inputVersion)
                    .then(needGenerateChangelog => {
                    core.info(`generate-changelog is set to 'auto' ${needGenerateChangelog
                        ? "the changelog should be created."
                        : "No need to generate changelog."}`);
                    return resolve(needGenerateChangelog);
                })
                    .catch(reject);
            default:
                return new reject(`The generate changelog option (${generateChangelogOption}) is not supported.`);
        }
    });
}
exports.isNeedGenerateChangelog = isNeedGenerateChangelog;
function autoDetectIsNeedGenerateChangelog(changelog_file, changelogHeaderRegex, changelogVersionRegex, inputVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const newVersion = yield (0, version_1.detectNewVersion)(inputVersion);
        const newestChangelogVersion = yield getNewestChangelogVersion(changelog_file, changelogHeaderRegex, changelogVersionRegex);
        if (!newestChangelogVersion)
            return true;
        return newVersion.toLowerCase() !== newestChangelogVersion.toLowerCase();
    });
}
function getNewestChangelogVersion(changelog_file, changelogHeaderRegex, changelogVersionRegex) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(changelog_file))
            return Promise.resolve(null);
        const content = yield (0, utility_1.readFile)(changelog_file);
        const lines = content.split("\n");
        core.debug(`${changelog_file} was read. It has ${lines.length} lines.`);
        const latestHeaderLine = getChangelogHeaders(lines, 1, changelogHeaderRegex)[0].line;
        const versionMatch = latestHeaderLine.match(changelogVersionRegex);
        return versionMatch ? versionMatch[0] : null;
    });
}
exports.getNewestChangelogVersion = getNewestChangelogVersion;
//# sourceMappingURL=changelog.js.map