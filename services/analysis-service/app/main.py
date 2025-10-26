from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
# Used for making API calls to other services
import httpx 
import os

app = FastAPI(title="Code Analysis Service")

# The address of the AI Core service inside Docker
AI_CORE_URL = "http://ai-core-service:8000/api/v1/generate"

# Defines the data this service expects (just the code string)
class AnalysisRequest(BaseModel):
    code: str

# Defines the data this service sends back
class AnalysisResponse(BaseModel):
    linting_results: str
    ai_suggestions: str

# The main endpoint that does the analysis
@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_code(request: AnalysisRequest):
    
    # --- 1. Run Flake8 Linting ---
    linting_results = ""
    # Create a temporary file to hold the code
    with tempfile.NamedTemporaryFile(mode='w', delete=True, suffix=".py") as temp_file:
        temp_file.write(request.code)
        temp_file.flush() # Make sure it's written

        # Run the flake8 command
        process = subprocess.run(
            ['flake8', temp_file.name],
            capture_output=True, # Catch the output
            text=True
        )
        # Store the output (or a default message)
        linting_results = process.stdout if process.stdout else "No linting issues found."

    # --- 2. Prepare to Call AI Core Service ---
    ai_suggestions = ""
    # Create the detailed prompt for Gemini, including the code and linting results
    prompt_text = f"""
A user submitted this Python code:
---CODE---
{request.code}
---END CODE---

It produced these linting errors:
---LINTING---
{linting_results}
---END LINTING---

Please provide a brief, friendly analysis and suggest improvements to make the code more professional and robust, using markdown formatting.
    """
    
    # --- THIS IS THE CRITICAL FIX ---
    # Create the list of messages in the simple dictionary format
    # This is what the ai-core-service now expects in its GenerationRequest
    contents_to_send = [
        {"role": "system", "content": "You are a helpful coding assistant. You are given code and linting results. ONLY output the friendly analysis and suggestions, using markdown formatting."},
        {"role": "user", "content": prompt_text}
    ]
    # --- END OF CRITICAL FIX ---

    try:
        # Make the API call to the ai-core-service
        async with httpx.AsyncClient() as client:
            # Send the data as JSON, using the key "contents"
            response = await client.post(AI_CORE_URL, json={"contents": contents_to_send}, timeout=30.0) 
            
            # Check if the call was successful
            if response.status_code != 200:
                ai_suggestions = f"Error from AI service: {response.text}"
            else:
                # Extract the code/suggestions from the response
                ai_suggestions = response.json().get("code", "No suggestions provided.")
                
    except httpx.RequestError as e:
        # Handle errors connecting to the ai-core-service
        ai_suggestions = f"Could not connect to AI service: {e}"

    # Send the final results back to the frontend
    return AnalysisResponse(
        linting_results=linting_results,
        ai_suggestions=ai_suggestions
    )