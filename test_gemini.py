from google import genai
from google.genai.types import HttpOptions

# Se añade vertex=True para que use el ADC y el proyecto de GCP que configuraste
client = genai.Client(vertex=True, http_options=HttpOptions(api_version="v1"))

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='How does AI work?',
)
print(response.text)
