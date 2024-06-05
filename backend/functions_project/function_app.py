import azure.functions as func
import logging
import json
import pymupdf
from timeit import default_timer as timer
from generation.ai_clients import HistoryEntry, setup_hf_client, setup_openai_client, AIClient
from generation.ai_flashcard_program import verify_and_run

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="extract_blocks", methods=["POST"])
def http_extract_blocks_from_pdf(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function called")

    body_bytes = req.get_body()
    
    logging.info(f"Processing {len(body_bytes)} bytes")
    
    start = timer()
    
    document = pymupdf.Document(stream=body_bytes)
    
    blocks_per_page = [page.get_textpage().extractBLOCKS() for page in document]
    blocks = [block for block_list in blocks_per_page for block in block_list]
    texts = [block[4] for block in blocks if len(block) >= 5]
    
    end = timer()
    
    logging.info(f"Extracted {len(blocks)} blocks in {end - start}s")
    
    return func.HttpResponse(
        json.dumps([{"text": text} for text in texts]))


@app.route(route="generate_flashcards", methods=["POST"])
def http_generate_next_flashcards(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function called")

    service: str = req.headers.get("X-Flashcard-AI-Service")
    token: str = req.headers.get("X-Flashcard-AI-Token")
    model: str = req.headers.get("X-Flashcard-Model-Name")
    
    logging.info(f"User requested service '{service}' with model '{model}' and supplied token: '{token is not None}'")
    
    history: list[HistoryEntry] = [HistoryEntry(**entry) for entry in req.get_json().get("history")]
    
    logging.info(f"History has {len(history) if history else '<empty>'} entries and next text is '{history[-1].content}'")
    
    start = timer()
    
    client: AIClient = None
    
    if service and service.casefold() == "openai".casefold():
        client = setup_openai_client(model=(model if model else "gpt-3.5-turbo-0125"), token=token)
    else:
        client = setup_hf_client(model=(model if model else "meta-llama/Meta-Llama-3-70B-Instruct"), token=token)
    
    history = verify_and_run(client, history)
    
    end = timer()
    
    logging.info(f"Generated response in {end - start}s: {history[-1].content}")
    
    return func.HttpResponse(
        json.dumps({ "history": history }, default=vars))