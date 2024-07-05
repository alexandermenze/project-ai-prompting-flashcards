import { Api } from "@/lib/api"
import { CircleSlash2, Edit, Share, Trash } from "lucide-react"
import classNames from 'classnames'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


export default function FlashcardList(props: {
    flashcards: Api.Flashcard[],
    className: string,
    onEditFlashcard: (flashcard: Api.Flashcard) => void,
    onDeleteFlashcard: (flashcard: Api.Flashcard) => void
    onExportFlashcards: () => void
}) {

    if (props.flashcards.length === 0) {
        return (
            <div className={classNames("flex flex-col align justify-center items-center", props.className)}>
                <CircleSlash2 />
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Button variant="outline" className="w-fit self-end" onClick={props.onExportFlashcards}>Export <Share className="ml-2" /></Button>

            <ScrollArea className={cn("ml-6 my-6", props.className)}>
                <div className="flex flex-col items-center gap-5">
                    {props.flashcards.map((flashcard, i) => (
                        <Card key={i} className="w-full text-start py-4">
                            <CardContent className="py-0">
                                <div className="flex">
                                    <p className="font-semibold whitespace-pre-wrap">{flashcard.front}</p>
                                    <p className="text-right flex-grow min-w-fit ml-4">#{i + 1}</p>
                                </div>

                                <p className="whitespace-pre-wrap">{flashcard.back}</p>
                            </CardContent>
                            <CardFooter className="py-0 self-end">
                                <div className="flex gap-4 justify-end w-full">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="m-0">
                                                <Edit size={16} />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="min-w-[1000px] min-h-[700px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit flashcard</DialogTitle>
                                                <DialogDescription>
                                                    Make changes to the flashcard
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4 h-full">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="question" className="text-right">
                                                        Question
                                                    </Label>
                                                    <Input
                                                        id="question"
                                                        defaultValue={flashcard.front}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="answer" className="text-right">
                                                        Answer
                                                    </Label>
                                                    <Textarea
                                                        id="answer"
                                                        defaultValue={flashcard.back}
                                                        className="col-span-3 min-h-[600px]"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Save changes</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>


                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="m-0">
                                                <Trash size={16} color="#cc0000" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action will delete the selected flashcard.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => props.onDeleteFlashcard(flashcard)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}