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

## Working with Web Streams

Unfortunately browsers hasn't implemented using ReadableStream directly as an
async iterator, in the meantime, you could use this to convert them into one.

```js
function createStreamIterator (stream) {
	// return if browser already supports async iterator in stream
	if (Symbol.asyncIterator in stream) {
		return stream[Symbol.asyncIterator]();
	}

	let reader = stream.getReader();

	return {
		[Symbol.asyncIterator] () {
			return this;
		},
		next () {
			return reader.read();
		},
		return () {
			reader.releaseLock();
		},
		throw () {
			reader.releaseLock();
		},
	};
}
```
