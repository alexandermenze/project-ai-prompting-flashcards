import cn from "classnames";
import { FileDown, FileUp } from "lucide-react";
import { Fragment, ReactNode } from "react";
import { useDropzone } from "react-dropzone";

export default function PdfUploadPage(props: { className?: string, onUpload: (file: File) => void}) {

    return (
        <div className={cn(props.className, "w-full h-full")}>
            <PdfUpload onUpload={props.onUpload} />
        </div>
    )
}

function PdfUpload(props: { onUpload: (file: File) => void }) {

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': [] },
        multiple: false,
        onDrop: acceptedFiles => {
            if (acceptedFiles.length === 0)
                return

            props.onUpload(acceptedFiles[0])
        }
    })

    return (
        <div className="w-full h-full" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="flex flex-col w-full h-full items-center justify-center">
                {DropHint(isDragActive)}
            </div>
        </div>
    )
}

function DropHint(isDragActive: boolean): ReactNode {

    if (isDragActive) {
        return (
            <Fragment>
                <FileDown size={128} strokeWidth={1} />
                <p className="mt-4">Drop your PDF</p>
            </Fragment>
        )
    }

    return (
        <Fragment>
            <FileUp size={128} strokeWidth={1} />
            <p className="mt-4">Drag your PDF here or click to upload ...</p>
        </Fragment>
    )
}