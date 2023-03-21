import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { getCurrentBranchName } from "./utility";

interface IPrData {
  number: number;
}

export async function createPr(
  createPrForBranchName: string,
  isTestMode: boolean
): Promise<exec.ExecOutput | null> {
  if (!createPrForBranchName) return Promise.resolve(null);
  if (isTestMode) {
    core.info("Test mode is enable so skipping Create PR.");
    return Promise.resolve(null);
  }

  core.info("Create pull request...");
  return getCurrentBranchName().then(async currentBranchName =>
    exec
      .getExecOutput(
        `gh pr create -B ${createPrForBranchName} -H ${currentBranchName} --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body-file CHANGELOG.md`
      )
      .catch(e => {
        if (e.message.contains("already exists"))
          return updatePr(createPrForBranchName, currentBranchName);
        return e;
      })
  );
}

async function updatePr(
  targetBranchName: string,
  currentBranchName: string
): Promise<exec.ExecOutput> {
  return findActivePr(targetBranchName, currentBranchName).then(prNumber => {
    if (!prNumber)
      throw new Error("Can not find any active pull request to edit.");

    return exec.getExecOutput(
      `gh pr edit ${prNumber} --body-file CHANGELOG.md`
    );
  });
}

async function findActivePr(
  targetBranchName: string,
  currentBranchName: string
): Promise<string | null> {
  return exec
    .getExecOutput(
      `gh pr list -B ${targetBranchName} -H ${currentBranchName} --state open --json number`
    )
    .then(result => JSON.parse(result.stdout))
    .then((json: IPrData[]) => {
      switch (json.length) {
        case 0:
          return null;
        case 1:
          return json[0].number.toString();
        default:
          throw new Error("More than one pull requests found.");
      }
    });
}
