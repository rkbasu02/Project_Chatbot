var http = require('http');
var hostname = '127.0.0.1';
var port = 3000;


const projectId = 'robin-be9ea'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
const query = 'I know Hindi';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
process.env['GOOGLE_APPLICATION_CREDENTIALS'] = '/home/rupai/mydata/program/NODE/Robin-510c813306e1.json';
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const server = http.createServer((req, res) => {
    output = '';

    // The text query request.
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
	  .then(responses => {
	    console.log('Detected intent');
	    const result = responses[0].queryResult;
	    console.log(`  Query: ${result.queryText}`);
	    console.log(`  Response: ${result.fulfillmentText}`);
	    if (result.intent) {
	      console.log(`  Intent: ${result.intent.displayName}`);
	    } else {
	      console.log(`  No intent matched.`);
	    }
	  })
	  .catch(err => {
	    console.error('ERROR:', err);
	  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('DialogFlow result: <br>' + output);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

