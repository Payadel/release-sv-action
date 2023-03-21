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
        return findActivePr(createPrForBranchName, currentBranchName).then(
          prNumber => {
            if (!prNumber) {
              core.info(`Can not create pull request: ${e.toString()}`);
              core.info(`Can not find active pull request to update.`);
              return e;
            }
            core.info(
              "Can not create pull request because it is exist. Try update it."
            );
            return updatePr(prNumber);
          }
        );
      })
  );
}

async function updatePr(prNumber: string): Promise<exec.ExecOutput> {
  return exec.getExecOutput(`gh pr edit ${prNumber} --body-file CHANGELOG.md`);
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
