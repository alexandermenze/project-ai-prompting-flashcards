export module Api {

    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

    export const emptyContent = "NONE"

    type ResponseBlock = {
        text: string
    }

    type ResponseCompletion = {
        history: CompletionMessage[]
    }

    export type Flashcard = {
        front: string;
        back: string;
        history: CompletionMessage[];
    };

    export type CompletionMessage = {
        role: "system" | "assistant" | "user"
        content: string,
        is_text: boolean,
    }

    export async function extractBlocksFromPdf(pdfFile: File): Promise<string[]> {

        const fileBytes = await pdfFile.arrayBuffer()

        const response = await fetch(`${baseUrl}/api/extract_blocks`, {
            method: 'POST',
            body: fileBytes
        })

        const blocks: ResponseBlock[] = await response.json()

        return blocks.map(block => block.text)
    }

    export async function generateNextFlashcards(history: CompletionMessage[]): Promise<CompletionMessage[]> {

        const response = await fetch(`${baseUrl}/api/generate_flashcards`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ history: history })
        })

        const completion: ResponseCompletion = await response.json()

        return completion.history
    }

    export function isEmptyContent(message: string): boolean {
        return message.length === 0 || (message.length < 100 && message.indexOf(emptyContent) !== -1)
    }

    export function containsFlashcards(message: string): boolean {
        return message.match(/(front|back)"*\s*:/gi) !== null
    }

    export function extractFlashcards(message: string, currentHistory: CompletionMessage[]): Flashcard[] {
        const flashcardRegex = /(?:front|back)"*\s*:\s*"([^\"]*)/gi
        const matches = Array.from(message.matchAll(flashcardRegex))

        if (matches.length % 2 !== 0) {
            console.log("Message has invalid number of matches for flashcard extraction: ", message, matches)
        }

        const flashcards: Flashcard[] = []

        for (let i = 0; i < matches.length - 1; i += 2) {
            const front = matches[i][1]
            const back = matches[i + 1][1]

            flashcards.push({ front: front, back: back, history: currentHistory })
        }

        return flashcards
    }
}