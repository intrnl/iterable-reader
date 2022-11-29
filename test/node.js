import * as path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'node:fs';

import { createIterableReader } from '../src/index.js';

let filepath = path.join(fileURLToPath(import.meta.url), '../../package.json');
let stream = createReadStream(filepath);

let reader = createIterableReader(stream);
let decoder = new TextDecoder();

let chunk = new Uint8Array(32);
await reader.read(chunk);

console.log(decoder.decode(chunk));

await reader.seek(32);

await reader.read(chunk);
console.log(decoder.decode(chunk));
