from generation.ai_clients import AIClient, HistoryEntry

newline = "\n"

static_prompt = f"""
You are an assistant collaborating with me to create flashcards from course book content.
            
Instructions:
1. Whenever I surround text with three quotation marks like this \"""[TEXT]\""", generate flashcards based on this text.
2. For all other inputs, respond normally.

Flashcard Template:
- Use the following format for flashcards: {{ front: "[QUESTION]", back: "[ANSWER]" }}
- Fit the content into one of these placeholders.
- Preserve the given formatting and template.

If the input is too short or lacks relevant information, respond with only "NONE".

Examples:

Input: \"""Syllogism\nThis is a form of logical\nargumentation that\napplies deductive reason-\ning to reach a conclusion\nbased on two or more\npropositions that are\nassumed to be true.""\"
Flashcard: {{ front: "What is a Syllogism? How does it work?", back: "What?\n- A form of logical argumentation\n- Uses deductive reasoning\n\nHow does it work?\n- Based on 2 or more propositions\n- Propositions are assumed to be true\n- Leads to a conclusion" }}

Input: \"""Case-based systems store examples of concrete problems together with a successful\nsolution. When presented with a novel, previously unseen case, the system tries to\nretrieve a solution to a similar case and apply this solution to the case at hand. The key\nchallenge is to define a suitable similarity measure to compare problem settings.""\"
Flashcard: {{ front: "How do case-based systems work? (3)", back: "- Store examples of concrete problems with successful solutions\n- Retrieve a similar case's solution when presented with a novel problem\n- Key challenge: define a suitable similarity measure to compare problem settings" }}

Input: \"""This unit starts by providing an overview of artificial intelligence and then proceeds to\nexplain some of the details that make up this new technology. It will take you back to the\nyear 350 BC to illustrate how ideas about the artificial creation of intelligent processes\nhave evolved across the ages.""\"
Flashcard: {{ front: "When did ideas about AI start evolving from?", back: "350 BC" }}
"""


def setup_history_with_system_prompt(history: list[HistoryEntry]) -> list[HistoryEntry]:
    
    system_prompt = HistoryEntry(role="system", content=static_prompt, is_text=False)
    
    history.insert(0, system_prompt)
    
    return history
    

def verify_and_run(client: AIClient, history: list[HistoryEntry]) -> list[HistoryEntry]:
    
    if not history:
        history = setup_history_with_system_prompt()
    
    if history[0].content.find(static_prompt) != 0:
        history = setup_history_with_system_prompt(history)
    
    chat_compatible_history = [{"role": entry.role, "content": entry.content} for entry in history]
    
    response = client.chat_completion(messages=chat_compatible_history)
    
    history.append(HistoryEntry(role=response["role"], content=response["content"], is_text=False))
    
    return history