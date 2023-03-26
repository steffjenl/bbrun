import * as docker from './docker.js';
import { parseVars, load, loadBitbucketEnv } from './environment.js';

export default function exec(script, image, flags) {
  let environmentVars = flags.env ? parseVars(flags.env) : [];
  if (flags.envfile) {
    let loadEnvVars = load(flags.envfile);
    environmentVars = environmentVars.concat(loadEnvVars);
  }
  const commands = [].concat(
    environmentVars.map((x) => { return x && (x.includes('export') ? x : `export ${x}`); }),
    process.env.NODE_ENV === 'test' ? [] : loadBitbucketEnv(),
    'set -e',
    script
  );
  docker.run(commands, image, flags.dryRun, flags.interactive, flags.workDir, flags.ignoreFolder, flags.keepContainer);
}
