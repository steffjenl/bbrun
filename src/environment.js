"use strict";
import fs from 'fs';
import os from 'os';
import shell from 'shelljs';


export function save(env, location) {
  //TODO: validate
  fs.appendFileSync(`${location}`, env);
  console.log(`${env} saved to ${location}`);
}

export function load(location) {
  if (!fs.existsSync(location)) {
    return [];
  } else {
    return fs.readFileSync(location, "utf8").split("\n");
  }
}

export function loadBitbucketEnv() {
  let envArs = [
    'CI=true',
    'BBRUN=true',
    'BITBUCKET_SSH_KEY_FILE=~/.ssh/id_rsa'
  ];

  // retrieve BITBUCKET_BRANCH
  const commitHash = shell.exec(`git branch --show-current`, { async: false, silent: true });
  if (commitHash.code === 0 && commitHash.stdout) {
    envArs = envArs.concat(`BITBUCKET_BRANCH="${commitHash.stdout.trim()}"`);
  }

  // retrieve BITBUCKET_COMMIT
  const branchName = shell.exec(`git rev-parse HEAD`, { async: false, silent: true });
  if (branchName.code === 0 && branchName.stdout) {
    envArs = envArs.concat(`BITBUCKET_COMMIT="${branchName.stdout.trim()}"`);
  }

  // BITBUCKET_BUILD_NUMBER
  envArs = envArs.concat(`BITBUCKET_BUILD_NUMBER="${between(0,999)}"`);

  return envArs;
}

export function parseVars(envArg) {
  return envArg.match(/(?=\b[a-z])\w+=(?:(['"])(?:(?!\1).)*\1|[^,]*)/gi).map(x => x.trim());
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function between(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}
