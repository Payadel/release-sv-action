import { GenerateChangelogOptions } from "../inputs";
import { readFile } from "./utility";
import { detectNewVersion } from "./version";
import * as core from "@actions/core";
import fs from "fs";

export const DEFAULT_CHANGELOG_HEADER_REGEX = new RegExp(
    "#+( )+((\\[[^\\]]+]\\([^)]+\\))|[^ ]+)( )+\\([^)]+\\)"
);

export const DEFAULT_CHANGELOG_VERSION_REGEX = new RegExp(
    "(?:[[^]]*]|)s*([a-zA-Z0-9.]+)"
);

export interface IChangelogHeader {
    line: string;
    index: number;
}

export function readChangelogSection(
    changelog_file: string,
    targetVersion?: string,
    changelogHeaderRegex?: RegExp
): Promise<string> {
    return readFile(changelog_file).then(content => {
        core.debug(`Read ${changelog_file}.`);

        const lines = content.split("\n");
        core.debug(`It has ${lines.length} lines.`);

        changelogHeaderRegex =
            changelogHeaderRegex || DEFAULT_CHANGELOG_HEADER_REGEX;
        core.debug(`Regex: ${changelogHeaderRegex.source}`);

        const headerLines = getChangelogHeaders(
            lines,
            undefined,
            changelogHeaderRegex
        );

        let targetIndex: number;
        if (targetVersion) {
            core.debug(
                `Target version is ${targetVersion}. Try find target index.`
            );
            // Find target header (with specific version)
            targetIndex = headerLines.findIndex(line =>
                new RegExp(`\\b${targetVersion.toLowerCase()}\\b`).test(
                    line.line
                )
            );
            if (targetIndex < 0) {
                throw new Error(
                    `Can not find or detect any changelog with version ${targetVersion}.\n` +
                        "You can update regex or report this issue with details."
                );
            }
            core.debug(`Target index: ${targetIndex}`);
        } else {
            core.debug(
                `The targetVersion is not provided. So consider 0 as target index.`
            );
            targetIndex = 0;
        }

        const startLineIndex = headerLines[targetIndex].index;
        const endLineIndex =
            targetIndex + 1 < headerLines.length
                ? headerLines[targetIndex + 1].index
                : lines.length;

        core.debug(`Slice from ${startLineIndex} to ${endLineIndex}`);

        return lines.slice(startLineIndex, endLineIndex).join("\n");
    });
}

export function getChangelogHeaders(
    lines: string[],
    limit?: number,
    changelogHeaderRegex?: RegExp
): IChangelogHeader[] {
    core.debug(
        `Try find changelog headers from ${lines.length} lines with limit ${limit}`
    );

    const headerLines: { line: string; index: number }[] = [];
    changelogHeaderRegex =
        changelogHeaderRegex || DEFAULT_CHANGELOG_HEADER_REGEX;
    core.debug(`Regex is: ${changelogHeaderRegex.source}`);

    for (let i = 0; i < lines.length; i++) {
        if (!changelogHeaderRegex.test(lines[i])) continue;
        headerLines.push({ line: lines[i], index: i });
        if (limit && headerLines.length >= limit) return headerLines;
    }

    if (headerLines.length === 0) {
        throw new Error(
            "Can not find or detect any changelog header.\n" +
                `Current regex: ${changelogHeaderRegex.source}\n` +
                `Test on ${lines.length} lines.\n` +
                "You can update regex or report this issue with details."
        );
    }

    return headerLines;
}

export function isNeedGenerateChangelog(
    generateChangelogOption: GenerateChangelogOptions,
    changelog_file: string,
    inputVersion?: string,
    changelogHeaderRegex?: RegExp,
    changelogVersionRegex?: RegExp
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        switch (generateChangelogOption) {
            case "never":
                return resolve(false);
            case "always":
                return resolve(true);
            case "auto":
                changelogHeaderRegex =
                    changelogHeaderRegex || DEFAULT_CHANGELOG_HEADER_REGEX;
                changelogVersionRegex =
                    changelogVersionRegex || DEFAULT_CHANGELOG_VERSION_REGEX;

                return autoDetectIsNeedGenerateChangelog(
                    changelog_file,
                    changelogHeaderRegex,
                    changelogVersionRegex,
                    inputVersion
                )
                    .then(resolve)
                    .catch(reject);
            default:
                return new reject(
                    `The generate changelog option (${generateChangelogOption}) is not supported.`
                );
        }
    });
}

function autoDetectIsNeedGenerateChangelog(
    changelog_file: string,
    changelogHeaderRegex: RegExp,
    changelogVersionRegex: RegExp,
    inputVersion?: string
): Promise<boolean> {
    return detectNewVersion(inputVersion).then(newVersion =>
        getNewestChangelogVersion(
            changelog_file,
            changelogHeaderRegex,
            changelogVersionRegex
        ).then(newestChangelogVersion => {
            if (!newestChangelogVersion) return true;
            return (
                newVersion.toLowerCase() !==
                newestChangelogVersion.toLowerCase()
            );
        })
    );
}

export function getNewestChangelogVersion(
    changelog_file: string,
    changelogHeaderRegex: RegExp,
    changelogVersionRegex: RegExp
): Promise<string | null> {
    if (!fs.existsSync(changelog_file)) return Promise.resolve(null);

    return readFile(changelog_file).then(content => {
        const lines = content.split("\n");
        core.debug(`${changelog_file} was read. It has ${lines.length} lines.`);

        const latestHeaderLine = getChangelogHeaders(
            lines,
            1,
            changelogHeaderRegex
        )[0].line;

        const versionMatch = latestHeaderLine.match(changelogVersionRegex);
        return versionMatch ? versionMatch[0] : null;
    });
}
