import * as core from "@actions/core";
import { getInputsOrDefaults, IInputs, validateInputs } from "./inputs";
import { createReleaseFile } from "./helpers/utility";
import { createPullRequest } from "./helpers/prHelper";
import { IActionOutputs, setOutputs } from "./outputs";
import { readVersionFromNpm } from "./helpers/version";
import {
    installStandardVersionPackage,
    standardVersionRelease,
} from "./helpers/standard-version";
import { push, setGitConfigs } from "./helpers/git";
import { readChangelogSection } from "./helpers/changelog";
import { ExecOutput } from "@actions/exec";

const run = (
    default_inputs: IInputs,
    package_json_path: string,
    changelog_file: string
): Promise<void> =>
    mainProcess(default_inputs, package_json_path, changelog_file)
        .then(() => core.info("Operation completed successfully."))
        .catch(error => {
            core.error("Operation failed.");
            core.setFailed(
                error instanceof Error ? error.message : error.toString()
            );
        });

export default run;

function mainProcess(
    default_inputs: IInputs,
    package_json_file: string,
    changelog_file: string
): Promise<void> {
    return getInputsOrDefaults(default_inputs).then(inputs =>
        _validateInputs(inputs, package_json_file).then(() => {
            const outputs: IActionOutputs = {
                version: "",
                changelog: "",
                "release-filename": "",
                "pull-request-url": "",
            };
            return installStandardVersionPackage()
                .then(() => setGitConfigs(inputs.gitEmail, inputs.gitUsername))
                .then(() =>
                    standardVersionRelease(
                        inputs.generateChangelog,
                        changelog_file,
                        inputs.inputVersion,
                        inputs.changelogHeaderRegex
                    )
                )
                .then(newVersion =>
                    _releaseFiles(
                        inputs.skipReleaseFile,
                        inputs.releaseDirectory,
                        inputs.releaseFileName,
                        outputs
                    )
                        .then(() => _push(inputs.isTestMode))
                        .then(() =>
                            _changelog(
                                changelog_file,
                                newVersion,
                                outputs,
                                inputs.changelogHeaderRegex
                            )
                        )
                        .then(changelog =>
                            _createPr(
                                outputs,
                                changelog,
                                inputs.createPrForBranchName,
                                inputs.isTestMode
                            )
                        )
                        .then(() => (outputs.version = newVersion))
                        .then(() => setOutputs(outputs))
                );
        })
    );
}

function _validateInputs(inputs: IInputs, package_json_file: string) {
    return readVersionFromNpm(package_json_file).then(currentVersion =>
        validateInputs(inputs, currentVersion)
    );
}

function _createPr(
    outputs: IActionOutputs,
    body: string,
    createPrForBranchName?: string,
    isTestMode: boolean = false
): Promise<string | null> {
    if (isTestMode) {
        core.info(
            "The test mode is enabled so skipping pull request creation."
        );
        return Promise.resolve(null);
    }
    if (!createPrForBranchName) {
        core.info("No branch name provided so skipping pull request creation.");
        return Promise.resolve(null);
    }

    return createPullRequest(createPrForBranchName, body).then(
        prLink => (outputs["pull-request-url"] = prLink ?? "")
    );
}

function _releaseFiles(
    skipReleaseFile: boolean,
    releaseDirectory: string,
    releaseFileName: string,
    outputs: IActionOutputs
): Promise<string | null> {
    if (skipReleaseFile) {
        core.info(
            "Skip release file is requested so skip create release file."
        );
        return Promise.resolve(null);
    }
    return createReleaseFile(releaseDirectory, releaseFileName).then(
        releaseFileName => (outputs["release-filename"] = releaseFileName ?? "")
    );
}

function _push(isTestMode: boolean): Promise<ExecOutput | null> {
    if (isTestMode) return Promise.resolve(null);
    return push();
}

function _changelog(
    changelog_file: string,
    newVersion: string,
    outputs: IActionOutputs,
    changelogHeaderRegex?: RegExp
) {
    return readChangelogSection(
        changelog_file,
        newVersion,
        changelogHeaderRegex
    ).then(changelog => {
        outputs.changelog = changelog;
        return changelog;
    });
}
