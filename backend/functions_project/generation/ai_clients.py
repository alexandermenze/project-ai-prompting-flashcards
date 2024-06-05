from dataclasses import dataclass
from os import getenv
from huggingface_hub import InferenceClient
from openai import OpenAI

@dataclass
class HistoryEntry(object):
    role: str
    content: str
    is_text: bool


class AIClient(object):
    def __init__(self, model: str, max_tokens: int, hf_client: InferenceClient = None, openai_client: OpenAI = None) -> None:
        self.model = model
        self.max_tokens = max_tokens
        self.hf_client = hf_client
        self.openai_client = openai_client
    
    def chat_completion(self, messages: list[dict[str, str]]) -> dict[str, str]:
        if self.hf_client:
            response = self.hf_client.chat_completion(model=self.model, messages=messages, max_tokens=self.max_tokens)
            message = response.choices[0].message
            return { "role": message.role, "content": message.content }
        elif self.openai_client:
            response = self.openai_client.chat.completions.create(model=self.model, messages=messages, max_tokens=self.max_tokens)
            message = response.choices[0].message
            return { "role": message.role, "content": message.content }
        

def setup_hf_client(model: str, max_tokens: int = 200, token: str = None) -> AIClient:
    if not token:
        token = getenv("HUGGINGFACE_TOKEN")

    if not token:
        raise Exception("HuggingFace token is not set!")

    client = InferenceClient(token=token)
    
    return AIClient(hf_client=client, model=model, max_tokens=max_tokens)


def setup_openai_client(model: str, max_tokens: int = 200, token: str = None) -> AIClient:
    if not token:
        token = getenv("OPENAI_API_KEY")

    if not token:
        raise Exception("OpenAI api key is not set!")

    client = OpenAI(api_key=token)
    
    return AIClient(openai_client=client, model=model, max_tokens=max_tokens)