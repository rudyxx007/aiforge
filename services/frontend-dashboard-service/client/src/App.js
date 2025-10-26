import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

function App() {
  const [code, setCode] = useState("# Write your Python code here\ndef hello():\n  print('Hello World')");
  const [prompt, setPrompt] = useState("a flask server");
  const [linting, setLinting] = useState("Linting results will appear here.");
  const [suggestions, setSuggestions] = useState("AI suggestions will appear here.");

  // --- API Handlers ---

  const handleAnalyze = () => {
    // Note: We call our proxy server, not the microservice directly
    axios.post('/api/analysis/analyze', { code })
      .then(response => {
        setLinting(response.data.linting_results);
        setSuggestions(response.data.ai_suggestions);
      })
      .catch(error => {
        console.error('Error analyzing code:', error);
        setLinting("Error analyzing code.");
        setSuggestions(error.response ? error.response.data.detail : "Connection error");
      });
  };

  const handleGenerate = () => {
    // Note: The prompt from the input box is used here
    axios.post('/api/ai/generate', { contents: [
      { role: 'user', content: prompt } // Send a simple contents array with the user prompt
    ]})
      .then(response => {
        // SUCCESS: The AI Core Service returns JSON { "code": "..." }
        // We set the editor content directly from the 'code' key.
        setCode(response.data.code); 
      })
      .catch(error => {
        console.error('Error generating code:', error);
        let errorMessage = "Generation Error: Could not parse response.";
        if (error.response && error.response.data && error.response.data.detail) {
          // If the AI Service returns a structured error (like 500 or 400)
          errorMessage = `Error ${error.response.status}: ${error.response.data.detail}`;
        } else if (error.message) {
            // General connection/network error
            errorMessage = `Network Error: ${error.message}`;
        }

        // Display the cleaned error message in the editor
        setCode(`// ${errorMessage}\n// Check browser console for more details.`);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloud-Native AI Forge</h1>
      </header>

      <div className="container">
        {/* Left Panel: Code Editor */}
        <div className="panel">
          <h3>Code Editor</h3>
          <Editor
            height="50vh"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />
          <button onClick={handleAnalyze}>Analyze Code</button>
        </div>

        {/* Right Panel: AI & Analysis */}
        <div className="panel">
          <h3>Code Generation</h3>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt (e.g., 'a flask server')"
          />
          <button onClick={handleGenerate}>Generate Code</button>
          
          <hr />
          
          <h3>Analysis Results</h3>
          <h4>Linting (Flake8):</h4>
          <pre>{linting}</pre>
          <h4>AI Suggestions:</h4>
          <pre>{suggestions}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;