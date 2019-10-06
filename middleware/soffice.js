'use strict';

// file
const fs = require('fs');
// path
const path = require('path');
// child
const childProcess = require('child_process');
// tmp
const tmp = require('tmp');

// base64
const Base64 = require('js-base64').Base64;

// tmp clear
tmp.setGracefulCleanup();

// in context, next
module.exports = (context, next) => {
  // e.g. /tmp/tmp-1Ul5PLSfZ8HOi.doc
  const source = tmp.tmpNameSync({
    // postfix, ext
    postfix: path.extname(context.input.filename),
  });

  // e.g. tmp-1Ul5PLSfZ8HOi.jpg
  const destination =
    // source === /tmp/tmp-1Ul5PLSfZ8HOi.doc
    // basename === tmp-1Ul5PLSfZ8HOi
    path.basename(source, path.extname(context.input.filename)) +
    '.' +
    context.input.toExt;

  // decode64
  const fromContent = Base64.decode(context.input.fromContent);

  //test
  console.log(
    'source',
    source,
    'destination',
    destination,
    'fromContent',
    fromContent
  );

  // write to file
  fs.writeFileSync(source, fromContent);

  // child proces spawn
  // office
  const process = childProcess.spawn('soffice', [
    '--headless', // headless
    '--convert-to', // convert
    context.input.toExt, // data format
    source, // file source
  ]);

  // output, on_data, print out data
  process.stdout.on('data', data => console.log(data.toString()));
  // err, on_data, print out data
  process.stderr.on('data', data => console.log(data.toString()));

  // on close
  process.on('close', () => {
    fs.readFile(destination, (err, data) => {
      //test
      console.log('err', err, 'data', data);

      if (err) {
        context.error = err;
      } else {
        context.output = {
          resData: data,
        };
        //fs.unlinkSync(destination);
      }
      //fs.unlinkSync(source);
      next();
    });
  });
};
