const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 5001;

// Every 10 seconds, randomize parameters
const INTERVAL = 10000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const eventsHandler = (request, response, next) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);

  const randomizeParameters = () => {
    const parameters = {
      activity: Math.random(),
      hazard: Math.random(),
    };
    const data = `data: ${JSON.stringify(parameters)}\n\n`;
    response.write(data);
  };

  const timer = setInterval(randomizeParameters, INTERVAL);

  randomizeParameters();
  request.on('close', () => {});
}

app.get('/', eventsHandler);

app.listen(PORT, () => {
  console.log(`Event source listening at http://localhost:${PORT}`)
})