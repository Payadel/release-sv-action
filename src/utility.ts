import * as exec from "@actions/exec";

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
