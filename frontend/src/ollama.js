
export const callOllama = async (prompt) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/llm/parse`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data;

    }

    catch (error) {
        console.error("Error fetching from ollama: ", error)
        throw error
    }
    
  }