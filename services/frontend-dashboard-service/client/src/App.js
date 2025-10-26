import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

function App() {
  const [code, setCode] = useState("# Write your Python code here\ndef hello():\n  print('Hello World')");
  const [prompt, setPrompt] = useState("a flask server");
  const [linting, setLinting] = useState("Linting results will appear here.");
  const [suggestions, setSuggestions] = useState("AI suggestions will appear here.");
  const [token, setToken] = useState(localStorage.getItem('authToken')); // Load token from browser storage
  const [username, setUsername] = useState(''); // For login form
  const [password, setPassword] = useState(''); // For login form
  const [projects, setProjects] = useState([]); // List of user's projects
  const [currentProjectId, setCurrentProjectId] = useState(''); // ID of the selected project
  const [newProjectName, setNewProjectName] = useState(''); // For create project form
  const [authError, setAuthError] = useState(''); // To display login/register errors
  const [projectError, setProjectError] = useState(''); // To display project errors

  // --- useEffect Hook ---
  // This runs once when the component first loads
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken); // Set token state if found in storage
      fetchProjects(storedToken); // Fetch projects using the stored token
    } else {
      setCode('# Please log in or register to manage projects.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // Empty dependency array means run only once on mount
  // --- END useEffect Hook ---

  // --- API Handlers ---

  // Function to handle user registration
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setAuthError(''); // Clear previous errors
    try {
      await axios.post('/api/auth/register', { username, password });
      // Automatically log in after successful registration
      handleLogin(e); 
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthError((error.response && error.response.data && error.response.data.detail) ? error.response.data.detail : 'Registration failed');
    }
  };

  // Function to handle user login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setAuthError(''); // Clear previous errors
    try {
      // NOTE: Login endpoint expects form data, not JSON
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const receivedToken = response.data.access_token;
      localStorage.setItem('authToken', receivedToken); // Save token to browser storage
      setToken(receivedToken); // Update state
      setUsername(''); // Clear form
      setPassword(''); // Clear form
      fetchProjects(receivedToken); // Fetch projects immediately after login
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('authToken'); // Clear any old token
      setToken(null);
      setAuthError((error.response && error.response.data && error.response.data.detail) ? error.response.data.detail : 'Login failed');
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove token from storage
    setToken(null); // Clear state
    setProjects([]); // Clear projects list
    setCurrentProjectId(''); // Clear selected project
    setCode('# Logged out. Please log in to manage projects.'); // Update editor
  };

  // Function to fetch user's projects
  const fetchProjects = async (authToken) => {
    if (!authToken) return; // Don't fetch if not logged in
    setProjectError('');
    try {
      const response = await axios.get('/api/projects/projects', {
        headers: { Authorization: 'Bearer ${authToken}' }, // Add the token!
      });
      setProjects(response.data || []); // Update projects state
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjectError((error.response && error.response.data && error.response.data.detail) ? error.response.data.detail : 'Could not load projects.');
      if (error.response?.status === 401) { // If token is invalid/expired
          handleLogout(); // Log the user out
      }
    }
  };

  // Function to create a new project
  const handleCreateProject = async () => {
    if (!token || !newProjectName) return; // Need token and name
    setProjectError('');
    try {
      await axios.post('/api/projects/projects', 
        { name: newProjectName, description: '' }, // Send project data
        { headers: { Authorization: `Bearer ${token}` } } // Add the token!
      );
      setNewProjectName(''); // Clear input form
      fetchProjects(token); // Refresh the project list
    } catch (error) {
      console.error('Failed to create project:', error);
      setProjectError(error.response?.data?.detail || 'Could not create project.');
      if (error.response?.status === 401) {
          handleLogout();
      }
    }
  };

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
      {/* --- UPDATED HEADER --- */}
      <header className="App-header">
        <h1>Cloud-Native AI Forge</h1>

        {/* Show Project controls only if logged in */}
        {token ? (
          <div className="project-controls">
            {/* Project Selector Dropdown */}
            <select 
              value={currentProjectId} 
              onChange={(e) => {
                  setCurrentProjectId(e.target.value);
                  // TODO: In a real app, you'd load the code for the selected project here
                  // For now, just clear the editor or show a message
                  const selectedProj = projects.find(p => p.id === parseInt(e.target.value));
                  setCode(`# Project selected: ${selectedProj ? selectedProj.name : 'None'}\n# Code loading/saving not implemented yet.`);
              }}
            >
              <option value="">-- Select Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* Create New Project */}
            <input 
              type="text" 
              placeholder="New project name" 
              value={newProjectName} 
              onChange={(e) => setNewProjectName(e.target.value)} 
              style={{ marginLeft: '10px' }}
            />
            <button onClick={handleCreateProject}>+ Create</button>
            {projectError && <span style={{ color: 'red', marginLeft: '10px' }}>{projectError}</span>}


            {/* Logout Button */}
            <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Logout</button>
          </div>
        ) : (
          // --- LOGIN/REGISTER FORM (Shown when logged out) ---
          <div className="auth-form">
             <form onSubmit={handleLogin}> {/* Can trigger login on Enter */}
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
               {authError && <p style={{ color: 'red', marginTop: '5px' }}>{authError}</p>}
             </form>
          </div>
        )}
      </header>
      {/* --- END UPDATED HEADER --- */}


      {/* --- Existing Container with Editor and AI Panels --- */}
      {/* Only show editor/AI tools if logged in */}
      {token ? (
         <div className="container">
           {/* Left Panel: Code Editor */}
           <div className="panel">
             <h3>Code Editor {currentProjectId ? `(Project ID: ${currentProjectId})` : ''}</h3>
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
      ) : (
         <p style={{marginTop: '50px'}}>Please log in or register to use the AI Forge.</p>
      )}
      {/* --- END Existing Container --- */}

    </div>
  );
} // End of App function

export default App;