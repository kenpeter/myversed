'use strict';

// file
const fs = require('fs');
// path
const path = require('path');
// child
const childProcess = require('child_process');
// tmp
const tmp = require('tmp');

// tmp clear
tmp.setGracefulCleanup();

module.exports = (context, next) => {
  // no autio
  if (context.input.type == 'audio' || context.input.type == 'video') {
      return next();
  }

  // from to tmp
  const source = tmp.tmpNameSync({ postfix: path.extname(context.input.filename) });
  const destination = path.basename(source, path.extname(context.input.filename)) + '.' + context.input.format;

  // source, buffer how big
  fs.writeFileSync(source, context.input.buffer);
    const process = childProcess.spawn('soffice', [
      '--headless', // headless
      '--convert-to', // convert
      context.input.format, // format
      source // from
    ]);
    
    process.stdout.on('data', data => console.log(data.toString()));
    process.stderr.on('data', data => console.log(data.toString()));

    process.on('close', () => {
        fs.readFile(destination, (err, data) => {
            if (err) {
                context.error = err;
            } else {
                context.output = { 
                    buffer: data
                };
                fs.unlinkSync(destination);
            }
            fs.unlinkSync(source);
            next();
        });
    });
};
