import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderCircle, Send, StepForward } from "lucide-react";
import { ReactNode, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Api } from "@/lib/api";

export type ChatMessage = {
    sender: "user" | "assistant" | "unprocessed"
    content: string,
    isText: boolean,
    flashcards: Api.Flashcard[] | null
}

export default function Chat(props: {
    className?: string,
    messages: ChatMessage[],
    loading: boolean,
    onUserInput: (input: string) => void
}): ReactNode {

    return (
        <div className={cn("flex flex-col h-full m-4", props.className)}>

            <ScrollArea className="flex-grow pr-6">
                <div className="flex flex-col gap-4">
                    {props.messages.map((message, i) => {

                        const isFirstUnprocessed = (i === 0 && message.sender === "unprocessed") ||
                            (i > 0 && props.messages[i - 1].sender !== "unprocessed" && message.sender === "unprocessed")


                        const showLoadingIndicator = props.loading && isFirstUnprocessed

                        return (
                            <ChatBlock key={i}
                                className="w-fit max-w-[80%]"
                                message={message}
                                showLoadingIndicator={showLoadingIndicator} />
                        )
                    })}
                </div>
            </ScrollArea>

            <ChatInput className="mb-8 w-3/4 self-center" inputEnabled={!props.loading} onInput={props.onUserInput} />

        </div>
    )
}


function ChatBlock(props: { className?: string, message: ChatMessage, showLoadingIndicator: boolean }): ReactNode {

    let senderClasses = "";
    if (props.message.flashcards && props.message.flashcards.length > 0) {
        senderClasses = "ml-8 bg-neutral-50";
    } else if (props.message.sender === "assistant" || (props.message.sender === "user" && props.message.isText === true)) {
        senderClasses = "";
    } else if (props.message.sender === "user" && props.message.isText === false) {
        senderClasses = "bg-purple-100 border-purple-200 self-end";
    } else if (props.message.sender === "unprocessed") {
        senderClasses = "bg-gray-200";
    }

    return (
        <Card className={cn("relative", senderClasses, props.className)}>
            <CardContent className="text-start py-4">
                <p className="whitespace-pre-wrap">{props.message.content}</p>

                {props.message.flashcards && props.message.flashcards.length > 0 && (
                    <div className="flex flex-wrap gap-5 mt-4 mb-2">
                        {props.message.flashcards.map((flashcard, i) => (
                            <ChatFlashcard key={i} className="w-fit max-w-[45%]" flashcard={flashcard} />
                        ))}
                    </div>
                )}
            </CardContent>
            {props.showLoadingIndicator &&
                <LoaderCircle className="animate-spin absolute -right-12 top-0 bottom-0 mt-auto mb-auto" size={32} strokeWidth={1} />
            }
        </Card>
    )
}

function ChatFlashcard(props: { className?: string, flashcard: Api.Flashcard }): ReactNode {
    return (
        <Card className={cn("flex flex-col gap-2", props.className)}>
            <CardContent className="text-start py-4">
                <div className="font-semibold whitespace-pre-wrap">{props.flashcard.front}</div>
                <div className="whitespace-pre-wrap">{props.flashcard.back}</div>
            </CardContent>
        </Card>
    )
}


function ChatInput(props: { className: string, inputEnabled: boolean, onInput: (input: string) => void }): ReactNode {
    const [value, setValue] = useState("")
    const [areaScrollHeight, setAreaScrollHeight] = useState(-1)

    return (
        <div className={cn("flex gap-2 px-8 pt-4", props.className)}>
            <Textarea
                className="flex-grow min-h-8"
                placeholder="Ask a question or hit enter to continue ..."
                value={value}
                style={{ height: areaScrollHeight }}
                onInput={e => {
                    const textArea = e.target as HTMLTextAreaElement

                    setAreaScrollHeight(textArea.scrollHeight)
                    setValue(textArea.value);
                }}
                disabled={!props.inputEnabled}
                rows={1} />
            <Button className="self-end" disabled={!props.inputEnabled} onClick={() => { props.onInput(value); setValue("") }}>
                {value.length > 0 ? <Send /> : <StepForward />}
            </Button>
        </div>
    )
}