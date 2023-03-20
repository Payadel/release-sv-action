import * as core from "@actions/core";
import * as exec from "@actions/exec";

let isTestMode;

async function main(): Promise<void> {
  try {
    const gitEmail = getInputOrDefault("git-email", "github-action@github.com");
    const gitUsername = getInputOrDefault("git-user-name", "Github Action");
    const inputVersion = getInputOrDefault("version", "");
    const skipChangelog = getBooleanInputOrDefault("skip-changelog", true);
    const releaseDirectory = getInputOrDefault("release_directory", ".");
    const releaseFilename = getInputOrDefault("release_file_name", "release");
    const createPrForBranchName = getInputOrDefault("create_pr_for_branch", "");
    isTestMode = core.getBooleanInput("is_test_mode") ?? false;

    await setGitConfigs(gitEmail, gitUsername)
      .then(() => installStandardVersionPackage())
      .then(() => release(inputVersion, skipChangelog))
      .then(() => push())
      .then(() => readVersion()
        .then(version => core.setOutput("version", version)))
      .then(() => createReleaseFile(releaseDirectory, releaseFilename))
      .then(() => createPr(createPrForBranchName));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

function getInputOrDefault(name: string, defaultValue: any): any {
  let input = core.getInput(name) ?? defaultValue;
  if (input == "")
    input = defaultValue;

  core.info(`${name}: ${input}`);
  if (isTestMode)
    core.setOutput(name, input);

  return input;
}

function getBooleanInputOrDefault(name: string, defaultValue: boolean) {
  let input = core.getBooleanInput(name) ?? defaultValue;

  core.info(`${name}: ${input}`);
  if (isTestMode)
    core.setOutput(name, input);

  return input;
}

async function setGitConfigs(email: string, username: string): Promise<exec.ExecOutput> {
  core.info("Config git...");
  return exec.getExecOutput(`git config --global user.email "${email}"`)
    .then(() => exec.getExecOutput(`git config --global user.name "${username}"`));
}

async function installStandardVersionPackage(): Promise<exec.ExecOutput> {
  core.info("Install standard-version npm package...");
  return exec.getExecOutput("npm install -g standard-version");
}

async function release(version: string, skipChangelog: boolean): Promise<exec.ExecOutput> {
  core.info("Create release...");
  let releaseCommand = "standard-version";
  if (version)
    releaseCommand += ` --release-as ${version}`;
  if (skipChangelog)
    releaseCommand += " --skip.changelog";

  core.info(`Command: ${releaseCommand}`);
  if (isTestMode)
    core.setOutput("releaseCommand", releaseCommand);

  return exec.getExecOutput(releaseCommand);
}

async function push(): Promise<exec.ExecOutput> {
  if (isTestMode)
    return exec.getExecOutput("echo 'Test mode is enable so skipping push...'");

  core.info("Push...");
  return exec.getExecOutput("git push --follow-tags origin $(git rev-parse --abbrev-ref HEAD)");
}

async function readVersion(): Promise<string> {
  return exec.getExecOutput("node -p -e \"require('./package.json').version\"")
    .then(result => result.stdout.trim())
    .then(version => {
      core.info(`Version: ${version}`);
      return version;
    });
}

async function createReleaseFile(directory: string, filename: string) {
  core.info("Create release file...");
  return exec.getExecOutput(`(cd ${directory} && zip -r "$(git rev-parse --show-toplevel)/${filename}.zip" .)`);
}

async function createPr(createPrForBranchName: string): Promise<exec.ExecOutput | null> {
  if (!createPrForBranchName)
    return Promise.resolve(null);
  if (isTestMode) {
    core.info("Test mode is enable so skipping Create PR.")
    return Promise.resolve(null);
  }

  core.info("Create pull request...");
  return exec.getExecOutput("git rev-parse --abbrev-ref HEAD")
    .then(result => result.stdout.trim())
    .then(currentBranchName => exec.getExecOutput(`gh pr create -B ${createPrForBranchName} -H ${currentBranchName} --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "$(cat CHANGELOG.md)"`));
}

main();
