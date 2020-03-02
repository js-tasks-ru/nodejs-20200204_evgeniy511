const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {

  constructor(options) {
    super(options);
    this._limit = options.limit;
    this._usedBytes = 0;
  }

  _transform(chunk, encoding, callback) {
    const bufferString = chunk.toString();
    const bufferStringLength = bufferString.length;
    const bytesSum = bufferStringLength + this._usedBytes;

    if (bytesSum <= this._limit) {
      callback(null, chunk.toString());
      this._usedBytes += chunk.length;
    } else {
      callback(new LimitExceededError());
    }
  }
}

module.exports = LimitSizeStream;
