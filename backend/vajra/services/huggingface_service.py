import os
from typing import Dict, Any
from dotenv import load_dotenv
import httpx

load_dotenv()

class HuggingFaceService:
    def __init__(self):
        self.api_key = os.getenv("HUGGINGFACE_API_KEY")
        self.api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
    
    async def generate_response(self, prompt: str, context: str = "") -> str:
        """Generate AI response using Hugging Face Inference API"""
        if not self.api_key or self.api_key == "your_huggingface_api_key":
            return "Please configure your Hugging Face API key in the .env file to use AI features."
        
        try:
            full_prompt = f"""
            You are Maya, an AI security assistant for a cybersecurity platform. 
            Context: {context}
            
            User question: {prompt}
            
            Provide a helpful, accurate response related to cybersecurity, threat intelligence, or security analysis.
            Keep responses concise and actionable.
            """
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "inputs": full_prompt,
                "parameters": {
                    "max_new_tokens": 512,
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "return_full_text": False
                }
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        return result[0].get("generated_text", "").strip()
                    elif isinstance(result, dict):
                        return result.get("generated_text", "").strip()
                    return "Error: Unexpected response format from Hugging Face API"
                elif response.status_code == 503:
                    return "Error: Model is loading, please try again in a few moments."
                else:
                    return f"Error: Hugging Face API returned status {response.status_code}"
                    
        except Exception as e:
            return f"Error generating AI response: {str(e)}"

huggingface_service = HuggingFaceService()
