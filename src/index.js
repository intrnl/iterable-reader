/**
 * @typedef {object} Reader
 * @property {(p: Uint8Array) => Promise<number | null>} read
 */

/**
 * @typedef {object} Seeker
 * @property {(offset: number) => Promise<number>} seek
 */

/**
 * @typedef {object} Closer
 * @property {() => void} close
 */

/** @typedef {Reader & Seeker} ReadSeeker */
/** @typedef {Reader & Closer} ReadCloser */
/** @typedef {Reader & Seeker & Closer} ReadSeekCloser */

/**
 * @param {Iterable<Uint8Array> | AsyncIterable<Uint8Array>} iterable
 * @returns {ReadSeekCloser}
 */
export function createIterableReader (iterable) {
	let iterator = Symbol.asyncIterator in iterable
		? iterable[Symbol.asyncIterator]()
		: iterable[Symbol.iterator]();

	/** @type {Uint8Array[]} */
	let pages = [];
	let buffer = new Uint8Array(0);

	let ptr = 0;
	let size = 0;
	let read = 0;

	return {
		async read (p) {
			while (size < p.byteLength) {
				let result = await iterator.next();

				if (result.done) {
					break;
				}

				let chunk = result.value;
				let length = chunk.byteLength;

				size += length;
				read += length;

				pages.push(chunk);
			}

			if (size < 1) {
				pages = [];
				buffer = new Uint8Array(0);
				return null;
			}

			let unwritten = p.byteLength;

			while (unwritten > 0) {
				let remaining = buffer.byteLength - ptr;
				let length = Math.min(unwritten, remaining);

				p.set(buffer.subarray(ptr, ptr + length), p.byteLength - unwritten);

				ptr += length;
				unwritten -= length;
				size -= length;

				if (ptr >= buffer.length) {
					if (pages.length < 1) {
						break;
					}

					buffer = pages.shift();
					ptr = 0;
				}
			}

			return p.byteLength - unwritten;
		},
		async seek (n) {
			while (size < n) {
				let result = await iterator.next();

				if (result.done) {
					break;
				}

				let chunk = result.value;
				let length = chunk.byteLength;

				size += length;
				read += length;

				pages.push(chunk);
			}

			ptr += n;
			size -= n;
			read += n;

			while (ptr >= buffer.byteLength && pages.length > 0) {
				ptr -= buffer.byteLength;
				buffer = pages.shift();
			}

			return read;
		},
		close () {
			iterator.return();
		},
	};
}
