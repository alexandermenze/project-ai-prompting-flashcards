import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import FlashcardList from "./FlashcardList"
import Chat, { ChatMessage } from "./Chat"
import { downloadFlashcardsCSV } from "@/lib/export"
import { useCallback, useEffect, useState } from "react"
import { Api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"


type UpdatedFlashcard = {
    flashcard: Api.Flashcard;
    updatedFront: string;
    updatedBack: string;
};

export default function GenerationPage(props: { contentBlocks: string[] }) {

    const [remainingBlocks, setRemainingBlocks] = useState<string[]>(props.contentBlocks)
    const [history, setHistory] = useState<Api.CompletionMessage[]>([])
    const [flashcards, setFlashcards] = useState<Api.Flashcard[]>([])
    const [deletedFlashcards, setDeletedFlashcards] = useState<Api.Flashcard[]>([])
    const [updatedFlashcards, setUpdatedFlashcards] = useState<UpdatedFlashcard[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

    const updateChatMessages = useCallback(() => {

        const collectedFlashcards: Api.Flashcard[] = []

        const processedMessages = history
            .map((historyEntry) => {
                if (historyEntry.role !== "user" && historyEntry.role !== "assistant")
                    return undefined

                return {
                    sender: historyEntry.role,
                    content: historyEntry.content,
                    isText: historyEntry.is_text,
                    flashcards: []
                } as ChatMessage
            })
            .filter((message) => message !== undefined)
            .map((message) => message as ChatMessage)
            .filter((message) => Api.isEmptyContent(message.content) === false)
            .map((message) => {

                const allFlashcards = Api.extractFlashcards(message.content, history)

                const notDeletedFlashcards = allFlashcards.filter((flashcard) =>
                    deletedFlashcards.some((deletedFlashcard) =>
                        deletedFlashcard.front === flashcard.front &&
                        deletedFlashcard.back === flashcard.back) === false)

                const updated = notDeletedFlashcards.map((flashcard) => {
                    const update = updatedFlashcards.find((u) => u.flashcard.front === flashcard.front && u.flashcard.back === flashcard.back)

                    if (update === undefined)
                        return flashcard

                    return { front: update.updatedFront, back: update.updatedBack } as Api.Flashcard
                })

                collectedFlashcards.push(...updated)

                if (allFlashcards.length > 0)
                    return { sender: message.sender, isText: false, content: "Here you go", flashcards: allFlashcards } as ChatMessage
                else
                    return message
            })

        const unprocessedMessages = remainingBlocks.map((block) => {
            return {
                sender: "unprocessed",
                content: block,
                isText: false,
                flashcards: []
            } as ChatMessage
        })

        setChatMessages([...processedMessages, ...unprocessedMessages])
        setFlashcards(collectedFlashcards)

    }, [remainingBlocks, history, deletedFlashcards, updatedFlashcards])

    const loadNextCompletion = useCallback(async (): Promise<void> => {

        if (loading)
            return

        setLoading(true)

        try {

            let blocks = remainingBlocks
            let updatedHistory = history

            do {

                const nextBlock = blocks[0]
                blocks = blocks.slice(1)

                console.log("Next block: ", nextBlock)

                const historyWithNext = [...updatedHistory, { role: "user", content: nextBlock, is_text: true } as Api.CompletionMessage]

                updatedHistory = await Api.generateNextFlashcards(historyWithNext)

                setHistory(updatedHistory)
                setRemainingBlocks(blocks)
            } while (
                Api.containsFlashcards(updatedHistory[updatedHistory.length - 1].content) === false &&
                blocks.length > 0)

        } finally {
            setLoading(false)
        }
    }, [remainingBlocks, history, loading])

    const respondToUserInput = useCallback(async (message: string) => {

        try {
            if (message === undefined || message.length === 0) {
                await loadNextCompletion()
                return
            }

            if (loading)
                return

            setLoading(true)

            const historyWithNext = [...history, { role: "user", content: message, is_text: false } as Api.CompletionMessage]

            const updatedHistory = await Api.generateNextFlashcards(historyWithNext)

            setHistory(updatedHistory)

        } catch (e) {
            console.error(e)

            const errorMessage = e instanceof Error ? e.message : "Please try again later."

            toast({
                variant: "destructive",
                title: "An error occurred while generating flashcards. Please try again.",
                description: errorMessage
            })
        } finally {
            setLoading(false)
        }

    }, [loadNextCompletion, loading])

    const updateFlashcard = useCallback((flashcard: Api.Flashcard, updatedFront: string, updatedBack: string) => {

        const updatedFlashcard: UpdatedFlashcard = { flashcard: flashcard, updatedFront, updatedBack }
        setUpdatedFlashcards([...updatedFlashcards, updatedFlashcard])

    }, [flashcards, updatedFlashcards])

    useEffect(updateChatMessages, [history, remainingBlocks, deletedFlashcards, updatedFlashcards])

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={67} minSize={50} maxSize={80}>
                <Chat messages={chatMessages} loading={loading} onUserInput={respondToUserInput} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
                <div className="flex flex-col h-full">
                    <p className="flex-grow-0 flex-none">Flashcards</p>

                    <FlashcardList className="flex-grow" flashcards={flashcards}
                        onEditFlashcard={updateFlashcard}
                        onDeleteFlashcard={flashcard => setDeletedFlashcards([...deletedFlashcards, flashcard])}
                        onExportFlashcards={() => downloadFlashcardsCSV(flashcards, "flashcards.csv")} />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
} 