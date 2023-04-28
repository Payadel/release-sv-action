import { getBooleanInputOrDefault, getInputOrDefault } from "./utility";

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

export function GetInputs(): Promise<IInputs> {
    return new Promise<IInputs>(resolve => {
        const inputs: IInputs = {
            isTestMode: getBooleanInputOrDefault("is-test-mode", false),
            gitEmail: getInputOrDefault(
                "git-email",
                "github-action@github.com"
            ),
            gitUsername: getInputOrDefault("git-user-name", "Github Action"),
            version: getInputOrDefault("version", ""),
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
        };
        return resolve(inputs);
    });
}
