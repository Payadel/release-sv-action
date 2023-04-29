import { GenerateChangelogOptions } from "../inputs";
import { readFile } from "./utility";
import { detectNewVersion } from "./version";

export function readChangelogSection(
    changelog_file: string,
    pattern: RegExp,
    version?: string
): Promise<string> {
    return readFile(changelog_file).then(content => {
        const lines = content.split("\n");

        // Find headers
        const headerLines: { line: string; index: number }[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i]))
                headerLines.push({ line: lines[i], index: i });
        }
        if (headerLines.length === 0) {
            throw new Error(
                "Can not find or detect any changelog header.\n" +
                    "You can update regex or report this issue with details."
            );
        }

        let targetIndex: number;
        if (version) {
            // Find target header (with specific version)
            targetIndex = headerLines.findIndex(line =>
                new RegExp(`\\b${version.toLowerCase()}\\b`).test(line.line)
            );
            if (targetIndex < 0) {
                throw new Error(
                    `Can not find or detect any changelog with version ${version}.\n` +
                        "You can update regex or report this issue with details."
                );
            }
        } else {
            targetIndex = 0;
        }

        const startLineIndex = headerLines[targetIndex].index;
        const endLineIndex =
            targetIndex + 1 < headerLines.length
                ? headerLines[targetIndex + 1].index
                : lines.length;

        return lines.slice(startLineIndex, endLineIndex).join("\n");
    });
}

export function needGenerateChangelog(
    generateChangelogOption: GenerateChangelogOptions,
    inputVersion: string,
    changelogVersionRegex: RegExp
): Promise<boolean> {
    switch (generateChangelogOption) {
        case "never":
            return Promise.resolve(false);
        case "always":
            return Promise.resolve(true);
        case "auto":
            return detectNewVersion(inputVersion).then(newVersion =>
                getNewestChangelogVersion(changelogVersionRegex).then(
                    newestChangelogVersion =>
                        newVersion.toLowerCase() ===
                        newestChangelogVersion.toLowerCase()
                )
            );
        default:
            throw new Error(
                `The generate changelog option (${generateChangelogOption}) is not supported.`
            );
    }
}
function getNewestChangelogVersion(pattern: RegExp): Promise<string> {
    return readChangelogSection("CHANGELOG.md", pattern);
}
