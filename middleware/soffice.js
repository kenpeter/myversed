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

// in context, next
module.exports = (context, next) => {
  // no autio
  if (context.input.type == 'audio' || context.input.type == 'video') {
    return next();
  }

  // abcsdf.doc
  const source = tmp.tmpNameSync({
    postfix: path.extname(context.input.filename),
  });

  //
  const destination =
    path.basename(source, path.extname(context.input.filename)) +
    '.' +
    context.input.format;

  // write sync: source to buffer
  fs.writeFileSync(source, context.input.buffer);

  // child proces spawn
  // office
  const process = childProcess.spawn('soffice', [
    '--headless', // headless
    '--convert-to', // convert
    context.input.format, // data format
    source, // file source
  ]);

  // output, on_data, print out data
  process.stdout.on('data', data => console.log(data.toString()));
  // err, on_data, print out data
  process.stderr.on('data', data => console.log(data.toString()));

  // on close
  process.on('close', () => {
    fs.readFile(destination, (err, data) => {
      if (err) {
        context.error = err;
      } else {
        context.output = {
          buffer: data,
        };
        fs.unlinkSync(destination);
      }
      fs.unlinkSync(source);
      next();
    });
  });
};
