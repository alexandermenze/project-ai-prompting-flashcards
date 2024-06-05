import { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"

export default function Layout(props: { children: ReactNode }) {
    return (
        <div className="flex flex-col h-full">
            <header>
                <h1 className="inline text-5xl mr-4">Flashcard Generator</h1>
                <p className="inline text-xl text-slate-500">by Alexander Menze</p>

                <Separator className="my-6" />
            </header>

            {props.children}

        </div>
    )
} 