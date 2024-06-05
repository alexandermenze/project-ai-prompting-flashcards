import Layout from './page/Layout'
import './App.css'
import PdfUploadPage from './page/PdfUploadPage'
import PdfExtractBlocksPage from './page/PdfExtractBlocksPage'
import { useState } from 'react'
import GenerationPage from './page/GenerationPage'

export default function App() {

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [contentBlocks, setContentBlocks] = useState<string[] | null>(null)

  return (
    <Layout>
      {pdfFile !== null && contentBlocks !== null ? <GenerationPage contentBlocks={contentBlocks} /> : null}

      {pdfFile !== null && contentBlocks === null ? <PdfExtractBlocksPage pdfFile={pdfFile} onExtract={setContentBlocks} /> : null}

      {pdfFile === null && contentBlocks === null ? <PdfUploadPage onUpload={setPdfFile} /> : null}
    </Layout>
  )
}
