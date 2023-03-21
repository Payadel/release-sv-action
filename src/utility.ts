import * as core from "@actions/core";
import * as exec from "@actions/exec";

export function getInputOrDefault(
  name: string,
  defaultValue: any,
  isTestMode: boolean
): any {
  let input = core.getInput(name) ?? defaultValue;
  if (input === "") input = defaultValue;

  core.info(`${name}: ${input}`);
  if (isTestMode) core.setOutput(name, input);

  return input;
}

export function getBooleanInputOrDefault(
  name: string,
  defaultValue: boolean,
  isTestMode: boolean
): boolean {
  const input = core.getBooleanInput(name) ?? defaultValue;

  core.info(`${name}: ${input}`);
  if (isTestMode) core.setOutput(name, input);

  return input;
}

export async function getCurrentBranchName(): Promise<string> {
  return exec
    .getExecOutput("git rev-parse --abbrev-ref HEAD")
    .then(result => result.stdout.trim());
}

export async function execBashCommand(
  command: string
): Promise<exec.ExecOutput> {
  return exec.getExecOutput(`/bin/bash -c "${command}"`);
}
