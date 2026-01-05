import type { RawRow } from '../../../features/deepseek/deepseekService'

export const parsePdf = async (file: File): Promise<RawRow[]> => {
  try {
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
    
    const arrayBuffer = await file.arrayBuffer()
    const data = await pdfParse(Buffer.from(arrayBuffer))

    const text = data.text
    const lines = text.split('\n').filter(line => line.trim().length > 0)

    const rawRows: RawRow[] = lines.map((line, index) => ({
      id: `pdf_${file.name}_${index}`,
      rowText: line.trim(),
      page: 0,
      rowNo: index,
    }))

    return rawRows
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const extractTransactionBlocks = (rawRows: RawRow[]): RawRow[][] => {
  const blocks: RawRow[][] = []
  let currentBlock: RawRow[] = []

  const datePattern = /\d{2}[./-]\d{2}[./-]\d{2,4}/

  for (const row of rawRows) {
    if (datePattern.test(row.rowText)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock)
      }
      currentBlock = [row]
    } else if (currentBlock.length > 0) {
      currentBlock.push(row)
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock)
  }

  return blocks
}
