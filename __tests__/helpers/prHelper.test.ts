import * as exec from "@actions/exec";
import { mockGetExecOutput } from "../mocks.utility";
import { createPullRequest } from "../../src/helpers/prHelper";

jest.mock("@actions/exec");

describe("createPullRequest", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("create pr successful", async () => {
        const currentBranchName = "dev";
        const createPrForBranchName = "main";
        const body = "body";
        const prLink = "https://github.com/user/repo/pull/1000";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: currentBranchName,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`,
                    success: true,
                    resolve: {
                        stdout:
                            "Warning: 7 uncommitted changes\n" +
                            "\n" +
                            `Creating pull request for ${currentBranchName} into ${createPrForBranchName} in user/repo\n` +
                            "\n" +
                            prLink,
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(
            createPullRequest(createPrForBranchName, body)
        ).resolves.toBe(prLink);
    });

    it("github output has not pr link", async () => {
        const currentBranchName = "dev";
        const createPrForBranchName = "main";
        const body = "body";
        const prLink = "";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: currentBranchName,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`,
                    success: true,
                    resolve: {
                        stdout: prLink,
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(
            createPullRequest(createPrForBranchName, body)
        ).rejects.toThrow(
            "Failed to extract pull request URL from command output."
        );
    });

    it("create pr fails because it already exists", async () => {
        const currentBranchName = "dev";
        const createPrForBranchName = "main";
        const body = "body";
        const prLink = "https://github.com/user/repo/pull/1000";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: currentBranchName,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`,
                    success: true,
                    resolve: {
                        stdout:
                            "Warning: 7 uncommitted changes\n" +
                            `a pull request for branch ${currentBranchName} into branch ${createPrForBranchName} already exists:\n` +
                            `${prLink}`,
                        exitCode: 1,
                        stderr: "",
                    },
                },
                {
                    command: `gh pr edit "${prLink}" --body "${body}"`,
                    success: true,
                    resolve: {
                        stdout: prLink,
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(
            createPullRequest(createPrForBranchName, body)
        ).resolves.toBe(prLink);
    });

    it("create pr fails because it already exists but update operation fails because can not find pr link", async () => {
        const currentBranchName = "dev";
        const createPrForBranchName = "main";
        const body = "body";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: currentBranchName,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`,
                    success: true,
                    resolve: {
                        stdout:
                            "Warning: 7 uncommitted changes\n" +
                            `a pull request for branch ${currentBranchName} into branch ${createPrForBranchName} already exists:\n` +
                            "NO LINK!",
                        exitCode: 1,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(
            createPullRequest(createPrForBranchName, body)
        ).rejects.toThrow(
            `I tried to make a pull request from ${currentBranchName} to ${createPrForBranchName} but it didn't work. It seems that this pull request exists. I tried to find the link in the message, but I didn't succeed.`
        );
    });

    it("create pr fails because it already exists but update operation fails with unknown error", async () => {
        const currentBranchName = "dev";
        const createPrForBranchName = "main";
        const body = "body";
        const prLink = "https://github.com/user/repo/pull/1000";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: currentBranchName,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`,
                    success: true,
                    resolve: {
                        stdout:
                            "Warning: 7 uncommitted changes\n" +
                            `a pull request for branch ${currentBranchName} into branch ${createPrForBranchName} already exists:\n` +
                            `${prLink}`,
                        exitCode: 1,
                        stderr: "",
                    },
                },
                {
                    command: `gh pr edit "${prLink}" --body "${body}"`,
                    success: false,
                    rejectMessage: "Operation failed",
                },
            ])
        );

        await expect(
            createPullRequest(createPrForBranchName, body)
        ).rejects.toThrow(`Update pull request '${prLink}' failed.`);
    });
});
