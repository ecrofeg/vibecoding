declare module 'pdf-parse' {
  type PdfParseResult = {
    text: string
  }

  type PdfParse = (data: Uint8Array | ArrayBuffer) => Promise<PdfParseResult>

  const pdfParse: PdfParse
  export default pdfParse
}
