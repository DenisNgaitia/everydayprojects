import os
import json
from typing import List, Dict

# Lazy-initialize the Groq client to avoid crashing at import time
# when GROQ_API_KEY is not set
_client = None

def _get_groq_client():
    global _client
    if _client is None:
        try:
            from groq import Groq
            api_key = os.environ.get("GROQ_API_KEY")
            if api_key:
                _client = Groq(api_key=api_key)
            else:
                print("GROQ_API_KEY not set. Forge AI will use fallback quests.")
                return None
        except Exception as e:
            print(f"Failed to initialize Groq client: {e}")
            return None
    return _client

def generate_quests_from_syllabus(syllabus_text: str) -> List[Dict]:
    """
    Parses a syllabus text and uses Groq (Llama 3) to extract assignments
    and CATs, transforming them into gamified 'Quests'.
    """
    prompt = f"""
    You are the AI engine for 'The Forge', an RPG system for Kenyan university students.
    Read the following syllabus excerpt and identify any Assignments, CATs (Continuous Assessment Tests), or Projects.
    Convert each into a gamified "Quest" object in a JSON array.
    
    Rules for JSON output:
    - title: Gamified name (e.g., "Defeat the Networking CAT")
    - description: Brief description of the task.
    - xp_reward: Integer (10-50 for assignments, 100-200 for CATs).
    - type: "assignment" | "cat" | "project"
    
    Only output valid JSON array, nothing else.
    
    Syllabus Text:
    {syllabus_text}
    """

    client = _get_groq_client()
    if client is None:
        # Fallback for dev/demo if API key is missing
        return _fallback_quests()

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict JSON-only API. Only return valid JSON arrays."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
            temperature=0.2,
        )
        
        response_text = chat_completion.choices[0].message.content
        return json.loads(response_text)
    except Exception as e:
        print(f"Forge AI Error: {e}")
        return _fallback_quests()

def _fallback_quests() -> List[Dict]:
    """Fallback quest data for dev/demo when Groq API is unavailable."""
    return [
        {"title": "Survive the Database CAT", "description": "Read Chapters 1-3", "xp_reward": 100, "type": "cat"},
        {"title": "Submit OS Assignment", "description": "Write a bash script", "xp_reward": 50, "type": "assignment"}
    ]
