import * as core from "@actions/core";

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
    return new Promise<IInputs>((resolve, reject) => {
        try {
            const inputs: IInputs = {
                isTestMode: getBooleanInputOrDefault("is-test-mode", false),
                gitEmail: getInputOrDefault(
                    "git-email",
                    "github-action@github.com"
                ),
                gitUsername: getInputOrDefault(
                    "git-user-name",
                    "Github Action"
                ),
                version: getInputOrDefault("version", ""),
                skipChangelog: getBooleanInputOrDefault("skip-changelog", true),
                skipReleaseFile: getBooleanInputOrDefault(
                    "skip-release-file",
                    true
                ),
                releaseDirectory: getInputOrDefault("release-directory", "."),
                releaseFileName: getInputOrDefault(
                    "release-file-name",
                    "release"
                ),
                createPrForBranchName: getInputOrDefault(
                    "create-pr-for-branch",
                    ""
                ),
            };
            resolve(inputs);
        } catch (e) {
            reject(e);
        }
    });
}

export function exportInputsInTestMode(inputs: IInputs): void {
    for (const key of Object.getOwnPropertyNames(inputs)) {
        core.setOutput(key, inputs[key]);
    }
}

function getInputOrDefault(name: string, defaultValue: any): any {
    let input = core.getInput(name) ?? defaultValue;
    if (input === "") input = defaultValue;

    core.info(`${name}: ${input}`);
    return input;
}

function getBooleanInputOrDefault(
    name: string,
    defaultValue: boolean
): boolean {
    const input = core.getBooleanInput(name) ?? defaultValue;
    core.info(`${name}: ${input}`);
    return input;
}
