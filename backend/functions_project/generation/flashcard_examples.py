import json

class FlashcardExample(object):
    def __init__(self, name: str, input: str, front: str, back: str, reasons: list[str]):
        self.name = name
        self.input = input
        self.front = front
        self.back = back
        self.reasons = reasons
    
def create_flashcard_example(dict) -> FlashcardExample:
    return FlashcardExample(dict["name"], dict["input"], dict["front"], dict["back"], dict["reasons"])

def extract_examples_from_json_file(file_path: str) -> list[FlashcardExample]:
    with open(file_path) as f:
        return json.load(f, object_hook=create_flashcard_example)