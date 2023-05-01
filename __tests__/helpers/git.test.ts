import * as exec from "@actions/exec";
import { mockGetExecOutput } from "../mocks";
import {
    ensureBranchNameIsValid,
    getCurrentBranchName,
    push,
    setGitConfigs,
} from "../../src/helpers/git";

jest.mock("@actions/exec");

describe("getCurrentBranchName", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("execute successful. expected return trim branch name", async () => {
        const currentBranchName = "test-branch";
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: `    ${currentBranchName}     \n`,
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        const execOutput = await getCurrentBranchName();
        expect(execOutput).toEqual(currentBranchName);
    });

    it("Throw error if execute fails", () => {
        (exec.getExecOutput as jest.Mock).mockRejectedValueOnce(
            new Error("Failed to execute command")
        );

        expect(getCurrentBranchName).rejects.toThrow(Error);
    });
});

describe("push", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("pushes to the current branch with follow tags option", async () => {
        const currentBranchName = "test-branch";
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: `${currentBranchName}\n`,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: "git push --follow-tags origin test-branch",
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        const execOutput = await push();
        expect(execOutput.stdout).toBe("Ok");
    });

    test("throws an error if getting the current branch name fails", async () => {
        (exec.getExecOutput as jest.Mock).mockRejectedValueOnce(
            new Error("Failed to execute command")
        );
        await expect(push()).rejects.toThrow(
            "Detect current branch name failed.\nFailed to execute command"
        );
    });

    test("throws an error if pushing to the remote fails", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: "test-branch\n",
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: "git push --follow-tags origin test-branch",
                    success: false,
                    rejectMessage: "Push failed.",
                },
            ])
        );

        await expect(push()).rejects.toThrow(
            "Execute 'git push --follow-tags origin test-branch' failed.\nPush failed."
        );
    });
});

describe("setGitConfigs", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("success operation", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: 'git config --global user.email "email"',
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: 'git config --global user.name "username"',
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await setGitConfigs("email", "username");
        expect(exec.getExecOutput).toBeCalledTimes(2);
    });
});

describe("ensureBranchNameIsValid", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("branch is exist in local. should resolve", async () => {
        const branchName = "main";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: `git show-ref --verify refs/heads/${branchName}`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(ensureBranchNameIsValid("main")).resolves.not.toThrow();
    });

    it("branch is exist in remote. should resolve", async () => {
        const branchName = "main";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: `git show-ref --verify refs/heads/${branchName}`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 127,
                        stderr: `fatal: 'refs/heads/${branchName}' - not a valid ref`,
                    },
                },
                {
                    command: `git ls-remote --quiet --heads --exit-code origin ${branchName}`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(ensureBranchNameIsValid("main")).resolves.not.toThrow();
    });

    it("branch is not exist. should reject", async () => {
        const branchName = "invalid";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: `git show-ref --verify refs/heads/${branchName}`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 127,
                        stderr: `fatal: 'refs/heads/${branchName}' - not a valid ref`,
                    },
                },
                {
                    command: `git ls-remote --quiet --heads --exit-code origin ${branchName}`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 2,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(ensureBranchNameIsValid(branchName)).rejects.toThrow(
            `The branch '${branchName}' is not valid.`
        );
    });

    it("An error occurred, should reject", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: `git show-ref --verify refs/heads/success-success`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 127,
                        stderr: `fatal: 'refs/heads/success' - not a valid ref`,
                    },
                },
                {
                    command: `git ls-remote --quiet --heads --exit-code origin success-success`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: `git show-ref --verify refs/heads/success-fail`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 127,
                        stderr: `fatal: 'refs/heads/success' - not a valid ref`,
                    },
                },
                {
                    command: `git ls-remote --quiet --heads --exit-code origin success-fail`,
                    success: false,
                    rejectMessage: "fail",
                },
                {
                    command: `git show-ref --verify refs/heads/fail`,
                    success: false,
                    rejectMessage: "fail",
                },
                {
                    command: `git show-ref --verify refs/heads/failWithExitCode`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 10,
                        stderr: `error`,
                    },
                },
                {
                    command: `git show-ref --verify refs/heads/success-failWithExitCode`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 127,
                        stderr: `fatal: 'refs/heads/success' - not a valid ref`,
                    },
                },
                {
                    command: `git ls-remote --quiet --heads --exit-code origin success-failWithExitCode`,
                    success: true,
                    resolve: {
                        stdout: "",
                        exitCode: 127,
                        stderr: "error",
                    },
                },
            ])
        );

        await expect(ensureBranchNameIsValid("success-success")).resolves;
        await expect(ensureBranchNameIsValid("success-fail")).rejects.toThrow(
            "Failed to check is branch 'success-fail' exists in remote."
        );
        await expect(ensureBranchNameIsValid("fail")).rejects.toThrow(
            "Failed to check is branch 'fail' exists in local."
        );
        await expect(
            ensureBranchNameIsValid("failWithExitCode")
        ).rejects.toThrow("An unknown error occurred.\n" + "error");
        await expect(
            ensureBranchNameIsValid("success-failWithExitCode")
        ).rejects.toThrow("An unknown error occurred.\n" + "error");
    });
});
