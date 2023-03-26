"use strict";
import shell from 'shelljs';
import fs from 'fs';
import child_process from 'child_process';
import path from 'path';
import os from 'os';

const BUILD_SCRIPT = ".bbrun.sh";
const TMP_DIR = '.bbrun';

export function deleteBuildScript() {
  if (fs.existsSync(BUILD_SCRIPT)) {
    fs.unlinkSync(BUILD_SCRIPT);
  }

  if (fs.existsSync(`./${TMP_DIR}`)) {
    deleteFolderSync(`./${TMP_DIR}`);
  }
}

export function prepareBuildScript(commands) {
  deleteBuildScript();
  const script = "#!/usr/bin/env sh\n" + commands.join("\n");
  fs.writeFileSync(BUILD_SCRIPT, script);
}

export function checkExists() {
  const dockerStatus = shell.exec("docker -v", { silent: true });
  if (dockerStatus.code !== 0) {
    console.error(`
      Error: bbrun requires a valid Docker installation"
      Output:
          $ docker -v
          ${dockerStatus.stdout}`);
    process.exit(1);
  }
}

export function run(commands, image, dryRun, interactive, workDir, ignoreFolder, keepContainer) {
  let ignore = '';
  if (typeof ignoreFolder !== "undefined") {
    if (typeof ignoreFolder === "string") {
      ignoreFolder = [ignoreFolder];
    }
    ignore = ignoreFolder.map((f) => {
      return `-v ${shell.pwd()}/${TMP_DIR}/:${workDir}/${f}`;
    }).join(' ');
  }

  const rm = keepContainer ? "" : "--rm";
  if (keepContainer) {
    // keepContainer and interactive does not work together
    interactive = false
  }

  const cmd = interactive
    ? `run ${rm} -P -it --entrypoint=/bin/bash -v ${shell.pwd()}:${workDir} -w ${workDir} ${image}`
    : `run ${rm} -P -v ${shell.pwd()}:${workDir} -w ${workDir} ${image} bash ${BUILD_SCRIPT}`;

  if (dryRun) {
    console.log(`docker command:\n\tdocker ${cmd}`);
    console.log(`build script:\n\t${commands.join("\n\t")}`);
  } else if (interactive) {
    console.log(`opening shell for image "${image}, run "s"`);
    child_process.execFileSync("docker", cmd.split(" "), {
      stdio: "inherit"
    });
  } else {
    prepareBuildScript(commands);
    shell.exec(`docker ${cmd}`, { async: false });
    deleteBuildScript();
  }
}

export function extractImageName(image) {
  if (typeof image === "string" || image instanceof String) {
    return image;
  } else if (image.name) {
    return image.name;
  } else {
    throw new Error(`"${JSON.stringify(image)}" is not a valid image`);
  }
}

export function deleteFolderSync(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderSync(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
