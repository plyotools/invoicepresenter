import * as XLSX from 'xlsx'
import { InvoiceRow } from '../types'

// Required columns (case-insensitive)
const REQUIRED_COLUMNS = [
  'Account Name',
  'Issue Key',
  'Issue summary',
  'Work Description',
  'Logged Hours',
  'Work date',
  'Full name'
]

export interface ParseResult {
  success: boolean
  data?: InvoiceRow[]
  error?: string
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          resolve({
            success: false,
            error: 'Excel-filen er tom - ingen ark funnet'
          })
          return
        }

        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]

        if (!jsonData || jsonData.length === 0) {
          resolve({
            success: false,
            error: 'Excel-filen inneholder ingen data'
          })
          return
        }

        // Find header row (case-insensitive matching)
        let headerRowIndex = -1
        const headerRow: string[] = []

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.length === 0) continue

          const normalizedRow = row.map((cell: any) => String(cell).trim().toLowerCase())
          const foundColumns: string[] = []

          for (const requiredCol of REQUIRED_COLUMNS) {
            const normalizedRequired = requiredCol.toLowerCase()
            const colIndex = normalizedRow.findIndex((cell: string) => cell === normalizedRequired)
            if (colIndex !== -1) {
              foundColumns.push(row[colIndex] as string)
            }
          }

          if (foundColumns.length === REQUIRED_COLUMNS.length) {
            headerRowIndex = i
            headerRow.push(...row.map((cell: any) => String(cell).trim()))
            break
          }
        }

        if (headerRowIndex === -1) {
          const missingCols = REQUIRED_COLUMNS.join(', ')
          resolve({
            success: false,
            error: `Mangler påkrevde kolonner. Påkrevd: ${missingCols}`
          })
          return
        }

        // Create column index map (case-insensitive)
        const columnMap: { [key: string]: number } = {}
        for (let i = 0; i < headerRow.length; i++) {
          const normalizedHeader = headerRow[i].toLowerCase()
          for (const requiredCol of REQUIRED_COLUMNS) {
            if (normalizedHeader === requiredCol.toLowerCase()) {
              columnMap[requiredCol] = i
              break
            }
          }
        }

        // Parse data rows
        const invoiceRows: InvoiceRow[] = []
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.length === 0) continue

          // Check if row has any data
          const hasData = row.some((cell: any) => cell !== '' && cell !== null && cell !== undefined)
          if (!hasData) continue

          const invoiceRow: InvoiceRow = {
            accountName: String(row[columnMap['Account Name']] || '').trim(),
            issueKey: String(row[columnMap['Issue Key']] || '').trim(),
            issueSummary: String(row[columnMap['Issue summary']] || '').trim(),
            workDescription: String(row[columnMap['Work Description']] || '').trim(),
            loggedHours: String(row[columnMap['Logged Hours']] || '').trim(),
            workDate: String(row[columnMap['Work date']] || '').trim(),
            fullName: String(row[columnMap['Full name']] || '').trim()
          }

          // Only add rows that have at least some data
          if (invoiceRow.accountName || invoiceRow.issueKey || invoiceRow.workDescription) {
            invoiceRows.push(invoiceRow)
          }
        }

        if (invoiceRows.length === 0) {
          resolve({
            success: false,
            error: 'Ingen gyldige datarader funnet i Excel-filen'
          })
          return
        }

        // Sort alphabetically by Account Name
        invoiceRows.sort((a, b) => {
          const nameA = a.accountName.toLowerCase()
          const nameB = b.accountName.toLowerCase()
          return nameA.localeCompare(nameB)
        })

        resolve({
          success: true,
          data: invoiceRows
        })
      } catch (error) {
        resolve({
          success: false,
          error: `Feil ved lesing av Excel-fil: ${error instanceof Error ? error.message : 'Ukjent feil'}`
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Feil ved lesing av fil'
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

