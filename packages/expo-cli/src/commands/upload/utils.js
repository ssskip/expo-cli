import child_process from 'child_process';

import fs from 'fs-extra';
import ProgressBar from 'progress';
import axios from 'axios';

import log from '../../log';

export async function downloadFile(url, dest) {
  const response = await axios.get(url, { responseType: 'stream' });
  const fileSize = Number(response.headers['content-length']);
  const bar = new ProgressBar('Downloading [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    total: fileSize,
  });
  response.data.pipe(fs.createWriteStream(dest));
  return new Promise((resolve, reject) => {
    response.data.on('data', data => bar.tick(data.length));
    response.data.on('end', () => resolve(dest));
    response.data.on('error', reject);
  });
}

export async function spawnAndCollectJSONOutputAsync(program, args) {
  return new Promise((resolve, reject) => {
    try {
      const wrapped = [`${args.join(' ')}`];
      const options = { stdio: ['inherit', 'inherit', 'pipe'] };
      const child = child_process.spawnSync(program, wrapped, options);
      const rawJson = child.stderr.toString();
      resolve(JSON.parse(rawJson));
    } catch (error) {
      reject(error);
    }
  });
}

export function printFastlaneError(result) {
  if (result.rawDump.message) {
    log.error(result.rawDump.message);
  } else {
    log.error('Returned json: ');
    log.error(result.rawDump);
  }
}
