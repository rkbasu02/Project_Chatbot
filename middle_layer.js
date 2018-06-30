var http = require('http');
var dialogflow = require('dialogflow');
var qs = require('querystring');

var hostname = '127.0.0.1';
var port = 3000;

// You can find your project ID in your Dialogflow agent settings
var projectId = 'robin-a98cd'; //https://dialogflow.com/docs/agents#settings
var sessionId = projectId + Math.random(); //change it to a session variable for chatbot consistency for the same user
var languageCode = 'en-US';

// Instantiate a DialogFlow client.
process.env['GOOGLE_APPLICATION_CREDENTIALS'] = 'robin-a98cd-84462c856be6.json';
var sessionClient = new dialogflow.SessionsClient();

// Define session path
var sessionPath = sessionClient.sessionPath(projectId, sessionId);

//CREATE SERVER
const server = http.createServer((req, res) => {
    //////////////////START RECEIVE DATA FROM FRONT END LAYER//////////////////////////////////
    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
            var post = qs.parse(body);
            var query = post.query;
    //////////////////END RECEIVE DATA FROM FRONT END LAYER//////////////////////////////////

            ////////////////////START REQUEST & RESPONSE TO DIALOGFLOW ///////////////////////////////
            var request;
            var result;
            var output = 'Sorry, I didn\'t understand the request.'; //fallback output
            var intent = '';
            var device = '';
            var params;

            // The text query request to DialogFlow
            request = {
              session: sessionPath,
              queryInput: {
                text: {
                  text: query,
                  languageCode: languageCode,
                },
              },
            };

            // Send request and log result
            sessionClient
              .detectIntent(request)
              .then(function (responses) { //log JSON.stringify(responses[0]) to see the complete data structure
		console.log(JSON.stringify(responses[0].queryResult.parameters));
		//console.log(responses[0].queryResult.parameters.fields.devices.stringValue);
                if (responses[0].queryResult.intent) {
                    if (responses[0].queryResult.parameters.fields.devices) {
                        intent = responses[0].queryResult.intent.displayName;
                        device = responses[0].queryResult.parameters.fields.devices.stringValue
            ////////////////////END REQUEST & RESPONSE TO DIALOGFLOW ///////////////////////////////

                        ////////////////////START REQUEST & RESPONSE TO BACK END LAYER ///////////////////////////////
                        var postData = qs.stringify({
                            'intent': intent,
                            'device': device
                        });
			//var postData = 'intent='+intent+'&device='+device;

                        var request = http.request({
                                  protocol: 'http:',
                                  host: 'localhost',
                                  port: 4000,
                                  path: '/',
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Content-Length': Buffer.byteLength(postData)
                                  }                            
                            }, 
                            function(response) {
                                var body = '';

                                response.on('data', function(data) {
                                    body += data;
                                });

                                response.on('end', function() {
                            ////////////////////END REQUEST & RESPONSE TO BACK END LAYER ///////////////////////////////

                                    //////////////////START RETURN DATA TO FRONT END LAYER//////////////////////////////////
                                    if (body == '1')
                                        output = 'The requested device '+ device +' is available.';
                                    else
                                        output = 'The requested device '+ device +' is not available.';

                                    //return result to front end
                                    res.statusCode = 200;
                                    res.setHeader('Access-Control-Allow-Origin', '*');
                                    res.setHeader('Content-Type', 'text/plain');
                                    res.end(output);
                                    //////////////////END RETURN DATA TO FRONT END LAYER//////////////////////////////////
                                });
                        });

                        request.on('error', (e) => {
                          console.error(`problem with request: ${e.message}`);
                        });

                        request.write(postData);
                        request.end();
                    }
                } 
              })
              .catch(err => {
                console.error('ERROR:', err);
              });

	    /*//return result to front end
            res.statusCode = 200;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'text/plain');
            res.end(output);*/
        });
    }
    else {
      //return error to front end
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Protocol error');
    }
});

server.listen(port, hostname, () => {
  console.log(`Middle Layer Server running at http://${hostname}:${port}/`);
});

