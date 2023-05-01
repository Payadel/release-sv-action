import * as core from "@actions/core";
import { getInputsOrDefaults, validateInputs } from "../src/inputs";
import { mockGetExecOutput, mockGetInput } from "./mocks.utility";
import { DEFAULT_INPUTS } from "../src/configs";
import * as exec from "@actions/exec";

describe("GetInputs", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("It should take 13 parameters and return 13 parameters with default values.", async () => {
        const inputs = await getInputsOrDefaults(DEFAULT_INPUTS);

        const inputPropNames = Object.getOwnPropertyNames(inputs);
        expect(inputPropNames.length).toBe(13);
        expect(inputPropNames.length).toBe(
            Object.getOwnPropertyNames(DEFAULT_INPUTS).length
        );

        for (let name of inputPropNames)
            expect(inputs[name]).toEqual(DEFAULT_INPUTS[name]);
    });

    it("give valid parameters.", async () => {
        jest.mock("@actions/core");

        const givenInputs = {
            version: "1.1.1",
            "ignore-same-version-error": "true",
            "ignore-less-version-error": "true",
            "create-pr-for-branch": "main",
            "generate-changelog": "never",
            "skip-release-file": "false",
            "release-file-name": "release_name",
            "release-directory": "dir",
            "git-email": "email@email.com",
            "git-user-name": "username",
            "changelog-header-regex": "[0-9a-zA-Z]",
            "version-regex": "[0-9a-zA-Z]",
            "is-test-mode": "true",
        };
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(name, givenInputs, options)
        );

        const inputs = await getInputsOrDefaults(DEFAULT_INPUTS);

        expect(inputs.inputVersion).toBe(givenInputs.version);
        expect(inputs.ignoreSameVersionError).toBe(true);
        expect(inputs.ignoreLessVersionError).toBe(true);
        expect(inputs.createPrForBranchName).toBe(
            givenInputs["create-pr-for-branch"]
        );
        expect(inputs.generateChangelog).toBe(
            givenInputs["generate-changelog"]
        );
        expect(inputs.skipReleaseFile).toBe(false);
        expect(inputs.releaseFileName).toBe(givenInputs["release-file-name"]);
        expect(inputs.releaseDirectory).toBe(givenInputs["release-directory"]);
        expect(inputs.gitEmail).toBe(givenInputs["git-email"]);
        expect(inputs.gitUsername).toBe(givenInputs["git-user-name"]);
        expect(inputs.changelogHeaderRegex).toEqual(
            new RegExp(givenInputs["changelog-header-regex"])
        );
        expect(inputs.versionRegex).toEqual(
            new RegExp(givenInputs["version-regex"])
        );
        expect(inputs.isTestMode).toBe(true);
    });
});
