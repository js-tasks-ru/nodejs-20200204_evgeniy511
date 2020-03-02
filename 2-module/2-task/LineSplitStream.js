const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._data = '';
  }

  _transform(chunk, encoding, callback) {
    this._data += chunk.toString();
    
    callback(null);
  }

  _flush(callback) {
    this._data.split(os.EOL).forEach(l => {
      this.push(l);
    });
    callback(null);
  }
}

module.exports = LineSplitStream;
