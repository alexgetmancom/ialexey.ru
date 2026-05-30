class MultiLevelEncodingError extends Error {
  constructor() {
    super("Multi-level URL encoding is not allowed");
    this.name = "MultiLevelEncodingError";
  }
}
const ENCODING_REGEX = /%25[0-9a-fA-F]{2}/;
function validateAndDecodePathname(pathname) {
  if (ENCODING_REGEX.test(pathname)) {
    throw new MultiLevelEncodingError();
  }
  let decoded;
  try {
    decoded = decodeURI(pathname);
  } catch (_e) {
    throw new Error("Invalid URL encoding");
  }
  if (ENCODING_REGEX.test(decoded)) {
    throw new MultiLevelEncodingError();
  }
  return decoded;
}
export {
  MultiLevelEncodingError,
  validateAndDecodePathname
};
