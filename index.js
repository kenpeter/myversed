'use strict';

//fs
const fs = require('fs');
// path
const path = require('path');
// mime
const mime = require('mime');
// express
const express = require('express');
// get it
const bodyParser = require('body-parser');
// upload
const multer = require('multer');

// mid
const Middleware = require('./middleware');

// run next
let middleware = new Middleware();

// read the mid
fs.readdirSync(path.join(__dirname, 'middleware')).forEach(function(file) {
  middleware.use(require(path.join(__dirname, 'middleware', file)));
});

// express
const app = express();

// limit
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// pulic dir
app.use(express.static('public'));
// url encode
app.use(bodyParser.urlencoded({extended: true}));
// json
app.use(bodyParser.json());

// store
const storage = multer.memoryStorage();

// up
const upload = multer({storage: storage});

// https://stackoverflow.com/questions/31585890/send-base64-object-to-expressjs-server
// post, convert, single file
app.post('/api/1.0/convert', (req, res, next) => {
  const filename = req.body.filename;
  const fromMimetype = req.body.fromMimetype;
  const fromContent = req.body.fromContent; // base64
  const toExt = req.body.toExt;
  const localContext = {
    input: {
      filename: filename, // file.txt
      fromMimetype: fromMimetype,
      fromContent: fromContent, // base64
      toExt: toExt,
    },
  };

  //test
  console.log('localContext', localContext);

  middleware.run(localContext, context => {});

  res.status(200).end();

  /*
  // mime type
  const mimetype = mime.lookup(req.file.originalname);
  // mime type
  const type = mimetype.split('/')[0];

  // Run file through the pipeline
  middleware.run(
    {
      // input
      input: {
        // format, req, body, format
        format: req.body.format,
        // file name
        filename: req.file.originalname,
        mimetype: mimetype,
        // ?
        type: type,
        // ?
        buffer: req.file.buffer,
      },
    },
    context => {
      if (context.error) {
        console.error(context.error);
      }

      // Send the result or error
      if (context.output) {
        res.writeHead(200, {
          'Content-Type': mime.lookup(context.input.format),
          'Content-disposition':
            'attachment;filename=' +
            path.basename(
              context.input.filename,
              path.extname(context.input.filename)
            ) +
            '.' +
            req.body.format,
          'Content-Length': context.output.buffer.length,
        });
        res.end(context.output.buffer);
      } else {
        res.status(500).end();
      }
    }
  );
  */
});

app.listen(3000, function() {
  console.log('Listening on port 3000');
});
