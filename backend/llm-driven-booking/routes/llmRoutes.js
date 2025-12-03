// Fuke defines express router responsible for handling routes related to LLM functionality in
// Tiger Tix. Connects incoming API requests to appropriate controller function that processes 
// user prompts using Ollama. Serves as link between backend server and LLM processing logic.

const express = require('express');
const router = express.Router();
const { handleOllama } = require('../controllers/llmController');

router.post('/llm/parse', handleOllama);

module.exports = router;