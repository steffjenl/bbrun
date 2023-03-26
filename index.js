#!/usr/bin/env node

"use strict";
import meow from 'meow';
import bbrun from './src/bbrun.js';

const cli = meow(
  `
Usage
  $ bbrun <step> <options>

Options
    --template (-t), build template, defaults to "bitbucket-pipelines.yml"
    --pipeline (-p), pipeline to execute. "default" if not provided
    --env (-e), define environment variables for execution
    --envfile (-ef), define environment file variables for execution, defaults to ".env.bitbucket"
    --workDir (-w), docker working directory, defaults to "ws"
    --dryRun (-d), performs dry run, printing the docker command
    --interactive (-i), starts an interactive bash session in the container
    --ignoreFolder (-if), maps the folder to an empty folder (useful for forcing package managers to reinstall)
    --keepContainer (-k), does not remove the container after build (ignores --interactive)
    --help, prints this very guide

Examples:
  Execute all steps in the default pipeline from bitbucket-pipelines.yml
    $ bbrun
    $ bbrun --template bitbucket-template.yml
    $ bbrun --pipeline default
  Execute a single step by its name
    $ bbrun test
    $ bbrun "Integration Tests"
  Execute steps from different pipelines
    $ bbrun test --pipeline branches:master
  Define an environment variable
    $ bbrun test --env EDITOR=vim
    $ bbrun test --env "EDITOR=vim, USER=root"
`,
  {
    importMeta: import.meta,
    flags: {
      pipeline: {
        type: "string",
        alias: "p",
        default: "default"
      },
      template: {
        type: "string",
        alias: "t",
        default: "bitbucket-pipelines.yml"
      },
      env: {
        type: "string",
        alias: "e"
      },
      envfile: {
        type: "string",
        alias: "ef",
        default: ".env.bitbucket"
      },
      "workDir": {
        type: "string",
        alias: "w",
        default: "/ws"
      },
      interactive: {
        type: "boolean",
        alias: "i"
      },
      "keepContainer": {
        type: "boolean",
        alias: "k"
      },
      "dryRun": {
        type: "boolean",
        alias: "d"
      },
      "ignoreFolder": {
        type: "string",
        alias: "f"
      }
    }
  }
);

//try {
  bbrun(cli.flags, cli.input[0]);
//} catch (error) {
//  console.error(error.message);
//  process.exit(1);
//}
