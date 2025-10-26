import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

function App() {
  // --- State Variables ---
  const [code, setCode] = useState("# Write your Python code here...");
  const [prompt, setPrompt] = useState("a flask server");
  const [linting, setLinting] = useState("Linting results will appear here.");
  const [suggestions, setSuggestions] = useState("AI suggestions will appear here.");
  const [token, setToken] = useState(localStorage.getItem('authToken')); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [projects, setProjects] = useState([]); 
  const [currentProjectId, setCurrentProjectId] = useState(''); 
  const [newProjectName, setNewProjectName] = useState(''); 
  const [authError, setAuthError] = useState(''); 
  const [projectError, setProjectError] = useState(''); 

  // --- useEffect Hook (Runs Once on Load) ---
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken); 
      // Use await here to ensure projects are fetched before potential subsequent actions
      // Although in this simple case, it might not be strictly necessary
      const fetchInitialProjects = async () => {
          await fetchProjects(storedToken);
      };
      fetchInitialProjects();
    } else {
      setCode('# Please log in or register to manage projects.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // Empty array ensures this runs only once

  // --- API Call Functions ---

  const fetchProjects = async (authToken) => {
    if (!authToken) return; 
    setProjectError('');
    try {
      const response = await axios.get('/api/projects/projects', {
        // FIX: Added backticks (`) for template literal
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProjects(response.data || []); 
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // FIX: Ensured robust error message handling
      setProjectError((error.response && error.response.data && error.response.data.detail) 
                       ? error.response.data.detail : 'Could not load projects.');
      // Use optional chaining safely here as it's just reading status
      if (error.response?.status === 401) { 
           handleLogout(); 
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setAuthError(''); 
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      const receivedToken = response.data.access_token;
      localStorage.setItem('authToken', receivedToken); 
      setToken(receivedToken); // Update state - THIS TRIGGERS RE-RENDER

      // FIX: Removed redundant second call to fetchProjects
      await fetchProjects(receivedToken); // Fetch projects immediately with the new token

      setUsername(''); 
      setPassword(''); 
      
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('authToken'); 
      setToken(null);
      // FIX: Ensured robust error message handling
      setAuthError((error.response && error.response.data && error.response.data.detail) 
                   ? error.response.data.detail : 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); 
    setAuthError(''); 
    try {
      await axios.post('/api/auth/register', { username, password });
      // Automatically log in after successful registration
      // handleLogin will set the token and fetch projects
      handleLogin(e); 
    } catch (error) {
      console.error('Registration failed:', error);
      // FIX: Ensured robust error message handling
      setAuthError((error.response && error.response.data && error.response.data.detail) 
                   ? error.response.data.detail : 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); 
    setToken(null); 
    setProjects([]); 
    setCurrentProjectId(''); 
    setCode('# Logged out. Please log in to manage projects.'); 
  };

  const handleCreateProject = async () => {
    // Use the 'token' state variable here, as it should be up-to-date
    if (!token || !newProjectName) return; 
    setProjectError('');
    try {
      await axios.post('/api/projects/projects', 
        { name: newProjectName, description: '' }, 
        // FIX: Added backticks (`) for template literal
        { headers: { Authorization: `Bearer ${token}` } } 
      );
      setNewProjectName(''); 
      await fetchProjects(token); // Refresh project list using current token state
    } catch (error) {
      console.error('Failed to create project:', error);
      // FIX: Ensured robust error message handling
      setProjectError((error.response && error.response.data && error.response.data.detail) 
                       ? error.response.data.detail : 'Could not create project.');
       if (error.response?.status === 401) {
           handleLogout();
      }
    }
  };

  const handleAnalyze = () => {
    // Check if logged in before analyzing (optional, but good practice)
    if (!token) {
        setLinting("Please log in to analyze code.");
        setSuggestions("");
        return;
    }
    axios.post('/api/analysis/analyze', { code })
      .then(response => {
        setLinting(response.data.linting_results);
        setSuggestions(response.data.ai_suggestions);
      })
      .catch(error => {
        console.error('Error analyzing code:', error);
        setLinting("Error analyzing code.");
        setSuggestions((error.response && error.response.data && error.response.data.detail) 
                       ? error.response.data.detail : "Connection error");
      });
  };

  const handleGenerate = () => {
    // Check if logged in before generating
    if (!token) {
        setCode("// Please log in to generate code.");
        return;
    }
    axios.post('/api/ai/generate', { contents: [
      { role: 'user', content: prompt } 
    ]})
      .then(response => {
        setCode(response.data.code); 
      })
      .catch(error => {
        console.error('Error generating code:', error);
        let errorMessage = "Generation Error: Could not parse response.";
        if (error.response && error.response.data && error.response.data.detail) {
          // FIX: Added backticks (`) for template literal
          errorMessage = `Error  ${error.response.status}: ${error.response.data.detail}`;
        } else if (error.message) {
            // FIX: Added backticks (`) for template literal
            errorMessage = `Network Error: ${error.message}`;
        }
        // FIX: Added backticks (`) for template literal
        setCode(`// ${errorMessage}\n// Check browser console for more details.`);
      });
  };

// --- JSX Rendering ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloud-Native AI Forge</h1>

        {/* Conditional Rendering: Show controls if logged in, else show auth form */}
        {token ? (
          // --- LOGGED IN VIEW ---
          <div className="project-controls">
            {/* Project Selector Dropdown */}
            <select
              value={currentProjectId}
              onChange={(e) => {
                  const newId = e.target.value;
                  setCurrentProjectId(newId);
                  const selectedProject = projects.find(p => p.id === parseInt(newId));
                  const projectName = selectedProject ? selectedProject.name : 'None';
                  // Use backticks for the template literal string
                  setCode(`# Project selected: ${projectName}\n# Code loading/saving not implemented yet.`);
              }}
            >
              <option value="">-- Select Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* Create New Project Input and Button */}
            <input
              type="text"
              placeholder="New project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
            <button onClick={handleCreateProject}>+ Create</button>
            {/* Display project errors */}
            {projectError && <span style={{ color: 'red', marginLeft: '10px' }}>{projectError}</span>}

            {/* Logout Button */}
            <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Logout</button>
          </div>
        ) : (
          // --- LOGGED OUT VIEW ---
          <div className="auth-form">
             <form onSubmit={handleLogin}> {/* Form triggers login on submit */}
               <input
                 type="text"
                 placeholder="Username"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 required
               />
               <input
                 type="password"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
               <button type="submit">Login</button>
               <button type="button" onClick={handleRegister} style={{ marginLeft: '10px' }}>Register</button>
               {/* Display auth errors */}
               {authError && <p style={{ color: 'red', marginTop: '5px' }}>{authError}</p>}
             </form>
          </div>
        )}
      </header> {/* Closing header tag was potentially misplaced before */}

      {/* --- Main Content Area --- */}
      {/* Conditional Rendering for Editor/AI Panels */}
      {token ? (
         // --- LOGGED IN VIEW for main content ---
         <div className="container">
           {/* Left Panel: Code Editor */}
           <div className="panel">
             {/* Use JSX interpolation correctly */}
             <h3>
                Code Editor {currentProjectId ? `(Project ID: ${currentProjectId})` : ''}
             </h3>
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
         </div> // Closing container div
      ) : (
         // --- LOGGED OUT VIEW for main content ---
         <p style={{marginTop: '50px'}}>Please log in or register to use the AI Forge.</p>
      )}
    </div> // Closing App div
  ); // Closing return statement
} // End of App function

export default App;