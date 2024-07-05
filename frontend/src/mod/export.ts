import { Api } from "@/mod/api"
import { createObjectCsvStringifier } from "csv-writer"

export function toCSVString(flashcards: Api.Flashcard[]): string {
    const writer = createObjectCsvStringifier({
        header: ['Question', 'Answer']
    });

    return writer.stringifyRecords(flashcards.map(flashcard => {
        return {
            Question: flashcard.front,
            Answer: flashcard.back
        }
    }))
}

export function downloadFlashcardsCSV(flashcards: Api.Flashcard[], filename: string) {
    const csvString = toCSVString(flashcards)
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}