var http = require('http');
var qs = require('querystring');

var hostname = '127.0.0.1';
var port = 4000;
var available_devices = [];

available_devices['desktop'] = '1';
available_devices['laptop'] = '1';
available_devices['printer'] = '0';
available_devices['mouse'] = '1';
available_devices['projector'] = '0';

const server = http.createServer((req, res) => {
    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
		console.log(body);
            var post = qs.parse(body);
            var intent = post.intent;
            var device = post.device;

            output = available_devices[device];

            res.statusCode = 200;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'text/plain');
            res.end(output);
        });
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Protocol error');
    }       
});

server.listen(port, hostname, () => {
  console.log(`Back End Server running at http://${hostname}:${port}/`);
});

