import * as core from "@actions/core";
import { getInputsOrDefaults, validateInputs } from "../src/inputs";
import { mockGetExecOutput, mockGetInput } from "./mocks.utility";
import { DEFAULT_INPUTS } from "../src/configs";
import * as exec from "@actions/exec";

jest.mock("@actions/core");
jest.mock("@actions/exec");

describe("GetInputs", () => {
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

describe("validateInputs", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("give invalid branch name, should throw error", async () => {
        const inputs = DEFAULT_INPUTS;
        inputs.createPrForBranchName = "invalid";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: `git show-ref --verify refs/heads/${inputs.createPrForBranchName}`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 127,
                        stderr: `fatal: 'refs/heads/success' - not a valid ref`,
                    },
                },
                {
                    command: `git ls-remote --quiet --heads --exit-code origin ${inputs.createPrForBranchName}`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 2,
                        stderr: ``,
                    },
                },
            ])
        );

        await expect(validateInputs(inputs, "0")).rejects.toThrow(
            `The branch '${inputs.createPrForBranchName}' is not valid.`
        );
    });

    it("give valid version, should resolve", async () => {
        const inputs = DEFAULT_INPUTS;

        inputs.inputVersion = "1";
        await expect(validateInputs(inputs, "0")).resolves;

        inputs.inputVersion = "1.0.0";
        await expect(validateInputs(inputs, "0")).resolves;

        inputs.inputVersion = "1.1.1-beta";
        await expect(validateInputs(inputs, "0.0.0")).resolves;
    });

    it("give invalid version, should reject", async () => {
        const inputs = DEFAULT_INPUTS;

        inputs.inputVersion = "01";
        await expect(validateInputs(inputs, "0")).rejects.toThrow(
            "The version format '01' is not valid. If you want, you can change 'version-regex'."
        );

        inputs.inputVersion = "1.0.0";
        await expect(validateInputs(inputs, "1.0.0")).rejects.toThrow(
            "The input version '1.0.0' is same to the current version. If you want, you can set 'ignore-same-version-error' to ignore this error.\""
        );

        inputs.inputVersion = "1.1.1-beta";
        await expect(validateInputs(inputs, "2")).rejects.toThrow(
            "The input version '1.1.1-beta' is less than the current version '2'.  If you want, you can set 'ignore-less-version-error' to ignore this error."
        );
    });
});
