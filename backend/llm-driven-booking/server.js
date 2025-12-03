// Initializes and configures the express backend server for Tiger Tix. Sets up middleware and 
// mounts LLM related routes and ports. Acts as main entry point for handling requests and forwarding
// them to the correct handlers before returning to frontend.

const ollama = require('ollama')
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/llmRoutes');
app.use(cors());
app.use(express.json())
app.use('/api', routes);

module.exports = app

// app.post()

// Client-service runs on port 7001
if (require.main === module) {
  const PORT = 7001;
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server running at http://0.0.0.0:${PORT}`)
  );
}