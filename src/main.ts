import * as core from "@actions/core";
import * as exec from "@actions/exec";
import {
  execBashCommand,
  getBooleanInputOrDefault,
  getCurrentBranchName,
  getInputOrDefault,
} from "./utility";
import { createPr } from "./prHelper";

let isTestMode;

async function main(): Promise<void> {
  try {
    isTestMode = getBooleanInputOrDefault("is_test_mode", false, isTestMode);
    const gitEmail = getInputOrDefault(
      "git-email",
      "github-action@github.com",
      isTestMode
    );
    const gitUsername = getInputOrDefault(
      "git-user-name",
      "Github Action",
      isTestMode
    );
    const inputVersion = getInputOrDefault("version", "", isTestMode);
    const skipChangelog = getBooleanInputOrDefault(
      "skip-changelog",
      true,
      isTestMode
    );
    const skipReleaseFile = getBooleanInputOrDefault(
      "skip_release_file",
      true,
      isTestMode
    );
    const releaseDirectory = getInputOrDefault(
      "release_directory",
      ".",
      isTestMode
    );
    const releaseFilename = getInputOrDefault(
      "release_file_name",
      "release",
      isTestMode
    );
    const createPrForBranchName = getInputOrDefault(
      "create_pr_for_branch",
      "",
      isTestMode
    );

    await setGitConfigs(gitEmail, gitUsername)
      .then(() => installStandardVersionPackage())
      .then(() => release(inputVersion, skipChangelog))
      .then(() =>
        readVersion().then(version => core.setOutput("version", version))
      )
      .then(() =>
        createReleaseFile(releaseDirectory, releaseFilename, skipReleaseFile)
      )
      .then(() => push())
      .then(() => createPr(createPrForBranchName, isTestMode));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

async function setGitConfigs(
  email: string,
  username: string
): Promise<exec.ExecOutput> {
  core.info("Config git...");
  return exec
    .getExecOutput(`git config --global user.email "${email}"`)
    .then(() =>
      exec.getExecOutput(`git config --global user.name "${username}"`)
    );
}

async function installStandardVersionPackage(): Promise<exec.ExecOutput> {
  core.info("Install standard-version npm package...");
  return exec.getExecOutput("npm install -g standard-version");
}

async function release(
  version: string,
  skipChangelog: boolean
): Promise<exec.ExecOutput> {
  core.info("Create release...");
  let releaseCommand = "standard-version";
  if (version) releaseCommand += ` --release-as ${version}`;
  if (skipChangelog) releaseCommand += " --skip.changelog";

  core.info(`Command: ${releaseCommand}`);
  if (isTestMode) core.setOutput("releaseCommand", releaseCommand);

  return exec.getExecOutput(releaseCommand);
}

async function push(): Promise<exec.ExecOutput> {
  if (isTestMode)
    return exec.getExecOutput("echo 'Test mode is enable so skipping push...'");

  core.info("Push...");
  return getCurrentBranchName().then(currentBranchName =>
    exec.getExecOutput(`git push --follow-tags origin ${currentBranchName}`)
  );
}

async function readVersion(): Promise<string> {
  return exec
    .getExecOutput("node -p -e \"require('./package.json').version\"")
    .then(result => result.stdout.trim())
    .then(version => {
      core.info(`Version: ${version}`);
      return version;
    });
}

async function createReleaseFile(
  directory: string,
  filename: string,
  skipReleaseFile: boolean
): Promise<exec.ExecOutput | null> {
  if (skipReleaseFile) {
    core.info("Skip release file requested so skipping create release file.");
    return Promise.resolve(null);
  }

  core.info("Create release file...");
  return execBashCommand(
    `(cd ${directory}; zip -r $(git rev-parse --show-toplevel)/${filename}.zip .)`
  );
}

main();
