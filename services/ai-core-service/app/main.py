from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
# We need the Google GenAI library
from google import genai
# We also need these specific types for formatting the message
from google.genai.types import Content, Part 
import os

# --- Configuration ---
# Get the Gemini API key from the environment (.env file)
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    # Stop if the key is missing
    raise ValueError("GEMINI_API_KEY environment variable not set")

# Initialize the Gemini Client
client = genai.Client(api_key=api_key)
app = FastAPI(title="AI Core Service", version="1.0")

# --- Pydantic Models (Data Schemas) ---
# This defines what kind of data the service EXPECTS to receive
class GenerationRequest(BaseModel):
    # It expects a list of dictionaries, like [{"role": "user", "content": "..."}]
    contents: list[dict] 

# This defines what kind of data the service SENDS back
class GenerationResponse(BaseModel):
    code: str

# --- API Endpoints ---
# A simple check to see if the service is running
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-core-service"}

# The main endpoint that talks to Gemini
@app.post("/api/v1/generate", response_model=GenerationResponse)
async def generate_code_endpoint(request: GenerationRequest):
    # Check if the incoming message list is empty
    if not request.contents:
        raise HTTPException(status_code=400, detail="Contents cannot be empty")
    
    # --- THIS IS THE CRITICAL FIX ---
    # We create an empty list to hold the messages in Gemini's format
    gemini_contents = []
    # We loop through the list of simple dictionaries we received...
    for item in request.contents:
        # Gemini uses 'model' for system messages, 'user' for user messages
        role_map = {'system': 'model', 'user': 'user'} 
        # Get the correct role, default to 'user' if unknown
        gemini_role = role_map.get(item['role'], 'user') 
        
        # ...and convert each dictionary into Gemini's special Content/Part objects
        gemini_contents.append(
            Content(
                role=gemini_role, 
                parts=[Part(text=item['content'])] # Put the text content here
            )
        )
    # --- END OF CRITICAL FIX ---

    try:
        # Now, send the CORRECTLY FORMATTED list to Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash", # Use the fast, free model
            contents=gemini_contents, # Pass the list of Content objects
            config={"temperature": 0.5} # Control randomness
        )
        
        # Get the text response from Gemini
        generated_code = response.text
        # Send the code back to whoever called this service
        return GenerationResponse(code=generated_code)
        
    except Exception as e:
         # If anything goes wrong talking to Gemini, log it and send an error back
         print(f"Gemini API error: {e}")
         raise HTTPException(status_code=500, detail=f"Error during code generation: {e}")