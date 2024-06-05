import logging
from generation.flashcard_examples import FlashcardExample, extract_examples_from_json_file
from generation.ai_clients import AIClient, HistoryEntry

newline = "\n"

static_prompt = f"""
You are an assistant helping the user create flashcards from course book content. 
The content is formatted with markdown.

When the user sends you the next text block surrounded by \"\"\" you may respond with one of two possibilities:
a) When the last text blocks are too short or don't contain any relevant information you respond with \"NONE\" and nothing else.
b) When you have an idea for the next flashcard or multiple flashcards you respond with that. Try to fit all information from one block into a single flashcard if possible.
Your flashcard response must conform to this format:
{{ front: "<question>", back: "<answer>" }}

Remember that flashcards always have a frontside (question) and a backside (answer). The frontside may contain an actual question or something to explain. The backside should contain the correct answer. Make use of bullet points and numbered lists to split information on the backside to allow them to be easier learned.
Generate flashcards that help learners understand the subject matter, without referencing the course book's organization or learning outcomes.
Ignore any text blocks that seem to be related to the course book's structure, goals, or objectives, and instead focus on the content that discusses concepts, ideas, and facts about the subject.

The user can ask you to adjust the flashcards in between sending text blocks.
"""

def format_flashcard_ex(example: FlashcardExample) -> str:
    return f"""
Input: "{example.input}"
Front: "{example.front}"
Back: "{example.back}"
Reasons:
{newline.join([f"- {r}" for r in example.reasons])}
    """
    

def prepare_history_with_examples(history: list[HistoryEntry], examples: list[FlashcardExample]) -> list[HistoryEntry]:
    
    examples_prompt = f"""
Here are some examples for perfect flashcards. The input text, flashcard question and answer are placed in quotes. Understand their reasons to improve your flashcards and align them to these examples:
{newline.join([format_flashcard_ex(e) for e in examples])}
    """
    
    whole_prompt = f"{static_prompt}\n{examples_prompt}"
    
    logging.info(f"Generated system prompt: '{whole_prompt}'")
    
    system_prompt = HistoryEntry(role="system", content=whole_prompt, is_text=False)
    
    history.insert(0, system_prompt)
    
    return history
    

def setup_history_with_system_prompt(history: list[HistoryEntry]) -> list[HistoryEntry]:
    examples = extract_examples_from_json_file("./generation/flashcard_examples.json")
    
    logging.info(f"Loaded {len(examples)} example flashcards")
    
    return prepare_history_with_examples(history, examples)
    

def verify_and_run(client: AIClient, history: list[HistoryEntry]) -> list[HistoryEntry]:
    
    if not history:
        history = setup_history_with_system_prompt()
    
    if history[0].content.find(static_prompt) != 0:
        history = setup_history_with_system_prompt(history)
    
    chat_compatible_history = [{"role": entry.role, "content": entry.content} for entry in history]
    
    response = client.chat_completion(messages=chat_compatible_history)
    
    history.append(HistoryEntry(role=response["role"], content=response["content"], is_text=False))
    
    return history