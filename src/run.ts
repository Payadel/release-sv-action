import * as core from "@actions/core";
import {
    GenerateChangelogOptions,
    getInputsOrDefaults,
    IInputs,
    validateInputs,
} from "./inputs";
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

async function mainProcess(
    default_inputs: IInputs,
    package_json_file: string,
    changelog_file: string
): Promise<void> {
    let inputs = await _getValidatedInputs(default_inputs, package_json_file);
    if (inputs.isTestMode) core.warning("The test mode is enabled.");
    const outputs: IActionOutputs = {
        version: "",
        changelog: "",
        "release-filename": "",
        "pull-request-url": "",
    };
    await installStandardVersionPackage();
    let newVersion: string = await _standardVersionRelease(
        inputs.gitEmail,
        inputs.gitUsername,
        inputs.generateChangelog,
        changelog_file,
        inputs.inputVersion,
        inputs.changelogHeaderRegex
    );
    await _releaseFiles(
        inputs.skipReleaseFile,
        inputs.releaseDirectory,
        inputs.releaseFileName,
        outputs
    );
    await push(inputs.isTestMode);
    let changelog: string = await _changelog(
        changelog_file,
        newVersion,
        outputs,
        inputs.changelogHeaderRegex
    );
    await _createPr(
        outputs,
        changelog,
        inputs.createPrForBranchName,
        inputs.isTestMode
    );
    outputs.version = newVersion;
    return setOutputs(outputs);
}

async function _getValidatedInputs(
    default_inputs: IInputs,
    package_json_file: string
): Promise<IInputs> {
    let inputs = await getInputsOrDefaults(default_inputs);
    await _validateInputs(inputs, package_json_file);
    return inputs;
}

async function _standardVersionRelease(
    gitEmail: string,
    gitUsername: string,
    generateChangelog: GenerateChangelogOptions,
    changelog_file: string,
    inputVersion?: string,
    changelogHeaderRegex?: RegExp
): Promise<string> {
    await setGitConfigs(gitEmail, gitUsername);
    return await standardVersionRelease(
        generateChangelog,
        changelog_file,
        inputVersion,
        changelogHeaderRegex
    );
}

async function _validateInputs(
    inputs: IInputs,
    package_json_file: string
): Promise<void> {
    let currentVersion = await readVersionFromNpm(package_json_file);
    await validateInputs(inputs, currentVersion);
    return core.info("Inputs validated successfully.");
}

async function _createPr(
    outputs: IActionOutputs,
    body: string,
    createPrForBranchName?: string,
    isTestMode: boolean = false
): Promise<string | null> {
    if (!createPrForBranchName) {
        core.info("No branch name provided so skipping pull request creation.");
        return Promise.resolve(null);
    }

    let prLink = await createPullRequest(
        createPrForBranchName,
        body,
        isTestMode
    );
    return (outputs["pull-request-url"] = prLink ?? "");
}

async function _releaseFiles(
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
    let releaseFileName1 = await createReleaseFile(
        releaseDirectory,
        releaseFileName
    );
    return (outputs["release-filename"] = releaseFileName1 ?? "");
}

async function _changelog(
    changelog_file: string,
    newVersion: string,
    outputs: IActionOutputs,
    changelogHeaderRegex?: RegExp
) {
    let changelog = await readChangelogSection(
        changelog_file,
        newVersion,
        changelogHeaderRegex
    );
    outputs.changelog = changelog;
    return changelog;
}
