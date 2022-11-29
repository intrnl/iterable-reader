# iterable-reader

Convert Uint8Array iterables to Go-like Reader interface.

```js
import { createReadStream } from 'node:fs';
import { createIterableReader } from '@intrnl/iterable-reader';

let stream = createReadStream('./file.txt');
let reader = createIterableReader(stream);

let chunk = new Uint8Array(512);
await reader.read(chunk);
```
