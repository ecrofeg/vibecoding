export type RawRow = {
  id: string
  rowText: string
  page: number
  rowNo: number
}

const splitRows = (text: string): string[] =>
  text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

export const parsePdf = async (file: File): Promise<RawRow[]> => {
  const arrayBuffer = await file.arrayBuffer()
  const { default: pdfParse } = await import('pdf-parse')
  const data = await pdfParse(new Uint8Array(arrayBuffer))

  const rows: RawRow[] = []
  const pages = data.text.split('\f')

  pages.forEach((pageText, pageIndex) => {
    const lines = splitRows(pageText)
    lines.forEach((line, rowIndex) => {
      rows.push({
        id: `${pageIndex + 1}-${rowIndex + 1}`,
        rowText: line,
        page: pageIndex + 1,
        rowNo: rowIndex + 1,
      })
    })
  })

  return rows
}
