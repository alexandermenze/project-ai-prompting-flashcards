import { Fragment, useCallback, useEffect, useState } from "react";
import { Api } from "@/mod/api";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PdfExtractBlocksPage(props: { pdfFile: File, onExtract: (blocks: string[]) => void }) {

    const [blocks, setBlocks] = useState<string[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const extractBlocks = useCallback(async function () {
        try {
            setError(null)
            const blocks = await Api.extractBlocksFromPdf(props.pdfFile)
            setBlocks(blocks)
            props.onExtract(blocks)
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message)
            } else if (typeof e === "string") {
                setError(e)
            }
        }
    }, [props.pdfFile, props.onExtract])

    useEffect(() => {
        extractBlocks()
    }, [])

    if (blocks !== null) {
        return null
    }

    return (
        <div className="flex flex-col h-full w-full items-center justify-center">
            {blocks === null && error === null && <LoadingSpinner />}        
            {error !== null && <ErrorText text={error} onRetry={extractBlocks} />}
        </div>
    )
}

function LoadingSpinner() {
    return (
        <Fragment>
            <LoaderCircle className="animate-spin" size={128} strokeWidth={1} />
            <p className="mt-4">Extracting content from your PDF ...</p>
        </Fragment>
    )
}

function ErrorText(props: { text: string, onRetry: () => void }) {
    return (
        <Fragment>
            <Alert variant="destructive" className="min-w-fit w-fit">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    <div className="flex flex-col">
                        <p>The following error has occured:</p>
                        {props.text}
                    </div>
                </AlertDescription>
            </Alert>
            <Button onClick={props.onRetry} className="mt-4" variant="outline">Retry</Button>
        </Fragment>
    )
}