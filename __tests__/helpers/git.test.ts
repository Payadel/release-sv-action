import * as exec from "@actions/exec";
import { mockGetExecOutput } from "../mocks";
import { push } from "../../src/helpers/git";

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
        expect(exec.getExecOutput).toHaveBeenCalledWith(
            "git rev-parse --abbrev-ref HEAD"
        );
        expect(exec.getExecOutput).toHaveBeenCalledWith(
            `git push --follow-tags origin ${currentBranchName}`
        );
        expect(execOutput).toEqual({
            stdout: "Ok",
            stderr: "",
            exitCode: 0,
        });
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