const fs = require('fs');

const defaultOptions = {
    flags: 'r+',
    defaultEncoding: 'utf8',
    fd: null,
    mode: 0o666,
    autoClose: true
};


function Writter(filepath, options={}){
    var self = this;
    self.filepath = filepath || "";
    if(isObjectEmpty(options)){
        self.options = null;
    }else{
        self.options = options;
    }
}

var isObjectEmpty = function(obj){
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

Writter.prototype.writeStream = function(data, callback) {
    var self = this;
    if(self.options){
        var stream = fs.createWriteStream(self.filepath, self.options);
    }else{
        var stream = fs.createWriteStream(self.filepath, defaultOptions);
    }

    stream.once('open', function(fd) {
      stream.write(data);
      stream.end();
    });
}

Writter.prototype.appendFile = function (data, callback) {
    // Start writing to file
    var self = this;
    fs.appendFile(self.filepath, data, defaultOptions, function(err){
        if(err){
            callback(err);
        }else{
            callback(null);
        }
    });
}

module.exports = Writter;

