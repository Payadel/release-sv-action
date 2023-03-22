import * as core from "@actions/core";

export interface IInputs {
  isTestMode: boolean;
  gitEmail: string;
  gitUsername: string;
  inputVersion: string;
  skipChangelog: boolean;
  skipReleaseFile: boolean;
  releaseDirectory: string;
  releaseFilename: string;
  createPrForBranchName: string;
}

export function GetInputs(): Promise<IInputs> {
  return new Promise<IInputs>((resolve, reject) => {
    try {
      const inputs: IInputs = {
        isTestMode: getBooleanInputOrDefault("is_test_mode", false),
        gitEmail: getInputOrDefault("git-email", "github-action@github.com"),
        gitUsername: getInputOrDefault("git-user-name", "Github Action"),
        inputVersion: getInputOrDefault("version", ""),
        skipChangelog: getBooleanInputOrDefault("skip-changelog", true),
        skipReleaseFile: getBooleanInputOrDefault("skip_release_file", true),
        releaseDirectory: getInputOrDefault("release_directory", "."),
        releaseFilename: getInputOrDefault("release_file_name", "release"),
        createPrForBranchName: getInputOrDefault("create_pr_for_branch", ""),
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
