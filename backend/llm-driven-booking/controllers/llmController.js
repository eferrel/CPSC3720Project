// File defines a backend controller responsible for processing requests sent to the AI model.
// When client sends a prompt, the handleOllama() function calls ollamaInteraction() from the 
// model layer to create a response.


import { ollamaInteraction } from '../models/llmModel.js';
import { listEvents, handleTicketPurchase } from '../../client-service/controllers/clientController.js';


// searches model text output for a JSON object or array block
// Just trying to mimic the client service rn, not actually sure what we need in here
// Param - text - raw text output from AI model to search
// Return - matched object or null if not found
function extractJsonBlock(text) {
    if (!text || typeof text !== 'string') return null;
    const obj = text.match(/\{[\s\S]*\}/);
    const arr = text.match(/\[[\s\S]*\]/);
    return obj?.[0] ?? arr?.[0] ?? null;
}


// Extracts the main text or message content from different possible response formats
// Param - resp - the raw response object returned by model
// Return - extracted assistance text content
function getAssistantText(resp) {
    if (!resp) return '';
    if (typeof resp === 'string') return resp;
    if (resp?.choices?.[0]?.message?.content) return resp.choices[0].message.content;
    if (resp?.choices?.[0]?.content) return resp.choices[0].content;
    if (resp?.output) {
        try {
            return resp.output.map(o => {
                if (typeof o === 'string') return o;
                if (o?.content && typeof o.content === 'string') return o.content;
                if (o?.content && Array.isArray(o.content)) return o.content.map(c => c?.text || '').join('');
                return JSON.stringify(o);
            }).join(' ');
        } catch {
            return JSON.stringify(resp.output);
        }
    }
    if (resp?.message?.content) return resp.message.content;
    return JSON.stringify(resp);
}



// Cleans up the text, removing extra quotes or characters
// Returns the text that has been cleaned
// Param - text - text from AI model
// Returns - cleaned and trimmed version of the text 
function normalizeAssistantText(text) {
    if (!text) return '';
    text = String(text).trim();
    // If the model returned a quoted JSON string or escaped JSON, try JSON.parse to unescape
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
        try {
            const unquoted = JSON.parse(text); // handles escaped sequences
            return String(unquoted).trim();
        } catch {
            text = text.slice(1, -1).trim();
        }
    }
    return text;
}


// Handles incoming AI prompt requests and returns the model's processed response.
// Receives user input from request and sends it to the Ollama lanugage model then prompts
// the model's response into the correct format.
// Param - req - express request object containing user prompt in req.body
// Param - res - express response object to send back to model output
// Return - If successful, returns parsed object and error otherwise.
export const handleOllama = async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ollamaInteraction(prompt);

        console.log('ollama.rawResponse', JSON.stringify(response));

        if (!response) {
            const help = { 
                intent: null,
                event: null, 
                tickets: null,
                instruction: "Please provide a short request that includes the desired action, event, and number of tickets!",
                example: "I want to book 2 tickets for the jazz concert."
            };
          
            return res.status(200).json(help);
        }

        const rawText = normalizeAssistantText(getAssistantText(response) || JSON.stringify(response));

        console.log('assistant.rawText', rawText);

        if (!rawText) {
            const help = { 
                intent: null,
                event: null, 
                tickets: null,
                instruction: "Please provide a short request that includes the desired action, event, and number of tickets!",
                example: "I want to book 2 tickets for the jazz concert."
            };
            return res.status(200).json(help);
   
        }
     
        let parsed = null;
        try {
            parsed = JSON.parse(rawText);
        } catch (e) {
            const block = extractJsonBlock(rawText);
            if (block) {
                try { parsed = JSON.parse(block); rawText = block; } catch (e2) { /* fallthrough */ }
            }
        }

        console.log('assistant.parsed=', parsed);


        if (!parsed) {
            const help = { 
                intent: null,
                event: null, 
                tickets: null,
                instruction: "Please provide a short request that includes the desired action, event, and number of tickets!",
                example: "I want to book 2 tickets for the jazz concert."
            };
            return res.status(200).json(help);
    
        }

      let allEvents = [];
        try {
            const potentialEvents = await listEvents();
            console.log("Potential events: ", potentialEvents);
            if (Array.isArray(potentialEvents)) {
                allEvents = potentialEvents;
            }
         

        } catch (listErr) {
            console.error('listEvents threw: ', listErr);
        }

        console.log('allEvents.length=', Array.isArray(allEvents) ? allEvents.length : 0);

        const normalize = s => String(s || '').toLowerCase().replace(/[^\w\s]/g, '').trim();

        const queryName = parsed.event ? normalize(parsed.event) : null;

        let matched = [];
        try {
            if (queryName) {
                matched = allEvents.filter(ev => {
                    const n = normalize(ev.eventName ?? ev.eventDate ?? '');
                    return n.includes(queryName) || queryName.split(' ').every(tok => tok && n.includes(tok));
                });
            }
            else if (parsed.intent === 'view') {
                matched = allEvents;
            }
        } catch (filterErr) {
            console.error("error filtering events: ", filterErr);
        }

        if (!matched || matched.length === 0) {
            const instruction = "No matching events found for your request. Please make another one.";
            return res.status(200).type('text/plain').send(instruction);
        }

        return res.status(200).json({events: matched, tickets: parsed.tickets ?? 0, intent: parsed.intent ?? null});



    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to correctly chat with the AI model."})
    }

}





