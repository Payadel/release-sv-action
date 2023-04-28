import { getBooleanInputOrDefault, getInputOrDefault } from "./utility";
import { isVersionValid } from "./version";

export interface IInputs {
    isTestMode: boolean;
    gitEmail: string;
    gitUsername: string;
    version: string;
    skipChangelog: boolean;
    skipReleaseFile: boolean;
    releaseDirectory: string;
    releaseFileName: string;
    createPrForBranchName: string;
}

export function getInputs(): Promise<IInputs> {
    return new Promise<IInputs>((resolve, reject) => {
        const version = getInputOrDefault("version", "", true, false);
        if (version && !isVersionValid(version))
            return reject(new Error("The input version is not valid."));

        return resolve({
            version,
            isTestMode: getBooleanInputOrDefault("is-test-mode", false),
            gitEmail: getInputOrDefault(
                "git-email",
                "github-action@github.com"
            ),
            gitUsername: getInputOrDefault("git-user-name", "Github Action"),
            skipChangelog: getBooleanInputOrDefault("skip-changelog", true),
            skipReleaseFile: getBooleanInputOrDefault(
                "skip-release-file",
                true
            ),
            releaseDirectory: getInputOrDefault("release-directory", "."),
            releaseFileName: getInputOrDefault("release-file-name", "release"),
            createPrForBranchName: getInputOrDefault(
                "create-pr-for-branch",
                ""
            ),
        });
    });
}
