import { useState, useEffect } from 'react'
import { Container, FileInput, Table, Title, Stack, Alert, ActionIcon, Group, Anchor, Tooltip } from '@mantine/core'
import { IconAlertCircle, IconCopy, IconCheck, IconUpload } from '@tabler/icons-react'
import * as XLSX from 'xlsx'
import { getRandomDoneMessage } from './doneMessages'

interface TableRow {
  accountName: string
  issueKey: string
  issueSummary: string
  workDescription: string
  loggedHours: string
  workDate: string
  fullName: string
}

const REQUIRED_COLUMNS = [
  'Account Name',
  'Issue Key',
  'Issue summary',
  'Work Description',
  'Logged Hours',
  'Work date',
  'Full name'
]

function App() {
  const [file, setFile] = useState<File | null>(null)
  // TEMPORARY: Add dummy data for testing
  const [tableData, setTableData] = useState<TableRow[]>([
    {
      accountName: 'Test Account',
      issueKey: 'TEST-1',
      issueSummary: 'Test Issue',
      workDescription: 'Test work',
      loggedHours: '2.5',
      workDate: '2024-01-01',
      fullName: 'Test User'
    }
  ])
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [doneRows, setDoneRows] = useState<Set<number>>(new Set())
  const [doneMessage, setDoneMessage] = useState<string | null>(null)
  
  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (doneMessage) {
      const timer = setTimeout(() => {
        setDoneMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [doneMessage])

  const handleFileUpload = async (uploadedFile: File | null) => {
    setError(null)
    setFile(uploadedFile)
    // Keep dummy data if no file uploaded (for testing)
    if (uploadedFile) {
      setTableData([])
    }
    setDoneRows(new Set())

    if (!uploadedFile) {
      return
    }

    try {
      // Read the file as array buffer
      const arrayBuffer = await uploadedFile.arrayBuffer()
      
      // Parse the Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        setError('No sheets found in the Excel file')
        return
      }
      
      const worksheet = workbook.Sheets[firstSheetName]
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false
      }) as string[][]
      
      if (jsonData.length === 0) {
        setError('No data found in the Excel file')
        return
      }

      // Parse header row
      const headerRow = jsonData[0].map(col => String(col || '').trim())
      const headerLength = headerRow.length
      
      // Find column indices (case-insensitive, exact match preferred)
      const columnIndices: { [key: string]: number } = {}

      // Find indices for required columns
      for (const requiredCol of REQUIRED_COLUMNS) {
        const index = headerRow.findIndex(
          col => col.toLowerCase() === requiredCol.toLowerCase()
        )
        if (index === -1) {
          setError(`Required column "${requiredCol}" not found in the data`)
          return
        }
        columnIndices[requiredCol] = index
      }

      // Parse data rows
      const parsedData: TableRow[] = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i].map(cell => String(cell || ''))
        
        // Skip completely empty rows
        if (row.length === 0 || row.every(cell => !cell.trim())) {
          continue
        }

        // Pad row to match header length to handle trailing empty cells
        while (row.length < headerLength) {
          row.push('')
        }

        // Extract values using the column indices - now safe because row is padded
        // Replace newlines in Work Description with spaces to ignore soft breaks
        const workDescription = (row[columnIndices['Work Description']] ?? '')
          .replace(/\r\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        parsedData.push({
          accountName: (row[columnIndices['Account Name']] ?? '').trim(),
          issueKey: (row[columnIndices['Issue Key']] ?? '').trim(),
          issueSummary: (row[columnIndices['Issue summary']] ?? '').trim(),
          workDescription: workDescription,
          loggedHours: (row[columnIndices['Logged Hours']] ?? '').trim(),
          workDate: (row[columnIndices['Work date']] ?? '').trim(),
          fullName: (row[columnIndices['Full name']] ?? '').trim(),
        })
      }

      if (parsedData.length === 0) {
        setError('No data rows found after parsing')
        return
      }

      // Sort by Account Name alphabetically
      parsedData.sort((a, b) => {
        const nameA = a.accountName.toLowerCase()
        const nameB = b.accountName.toLowerCase()
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      })

      setTableData(parsedData)
    } catch (err) {
      setError(`Error parsing Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTableData([])
    }
  }

  const copyText = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleDone = (index: number) => {
    setDoneRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={1}>💰 Invoice Presenter</Title>
        
        {/* Show confirmation message when item is marked as done */}
        <div 
          data-testid="done-message-alert"
          style={{
            padding: '12px 16px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            marginBottom: '16px',
            display: doneMessage ? 'flex' : 'none',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconCheck size={18} />
          <div>
            <strong>💰 Done!</strong>
            {doneMessage && <div>{doneMessage}</div>}
          </div>
          <button
            type="button"
            onClick={() => setDoneMessage(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#155724'
            }}
          >
            ×
          </button>
        </div>
        
        <Stack gap="md">
          <FileInput
            label="Upload Excel file"
            placeholder="Select an Excel file (.xlsx, .xls)"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            value={file}
            onChange={handleFileUpload}
            leftSection={<IconUpload size={16} />}
          />
        </Stack>

        {error && (
          <Alert icon={<IconAlertCircle />} title="Error" color="red">
            {error}
          </Alert>
        )}

        {tableData.length > 0 && (
          <Table
            striped
            highlightOnHover
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '12.5%' }}>Account Name</Table.Th>
                <Table.Th style={{ width: '12.5%' }}>Issue Key</Table.Th>
                <Table.Th style={{ width: '12.5%' }}>Issue Summary</Table.Th>
                <Table.Th style={{ width: '12.5%' }}>Work Description</Table.Th>
                <Table.Th style={{ width: '12.5%' }}>Logged Hours</Table.Th>
                <Table.Th style={{ width: '12.5%' }}>Work Date</Table.Th>
                <Table.Th style={{ width: '12.5%' }}>Full Name</Table.Th>
                <Table.Th style={{ width: '12.5%' }}>Done</Table.Th>
              </Table.Tr>
            </Table.Thead>
              <Table.Tbody>
                {tableData.map((row, index) => (
                  <Table.Tr 
                    key={index}
                    style={{
                      backgroundColor: doneRows.has(index) ? '#e8f5e9' : undefined
                    }}
                  >
                    <Table.Td style={{ verticalAlign: 'top', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {row.accountName}
                      </div>
                    </Table.Td>
                    <Table.Td style={{ verticalAlign: 'top', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.issueKey ? (
                        <Anchor
                          href={`https://plyolabs.atlassian.net/browse/${row.issueKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ wordBreak: 'break-word' }}
                        >
                          {row.issueKey}
                        </Anchor>
                      ) : (
                        ''
                      )}
                    </Table.Td>
                    <Table.Td style={{ verticalAlign: 'top' }}>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {row.issueSummary}
                      </div>
                    </Table.Td>
                    <Table.Td style={{ verticalAlign: 'top' }}>
                      <Group gap="xs" wrap="nowrap" align="flex-start">
                        <div style={{ flex: 1, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {row.workDescription}
                        </div>
                        <Tooltip label={copiedIndex === index ? 'Copied!' : 'Copy work description'}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => copyText(row.workDescription, index)}
                            style={{ flexShrink: 0 }}
                          >
                            {copiedIndex === index ? (
                              <IconCheck size={16} color="green" />
                            ) : (
                              <IconCopy size={16} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                    <Table.Td style={{ verticalAlign: 'top', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {row.loggedHours}
                      </div>
                    </Table.Td>
                    <Table.Td style={{ verticalAlign: 'top', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {row.workDate}
                      </div>
                    </Table.Td>
                    <Table.Td style={{ verticalAlign: 'top', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {row.fullName}
                      </div>
                    </Table.Td>
                    <Table.Td style={{ verticalAlign: 'top' }}>
                      <button
                        type="button"
                        data-testid={`done-button-${index}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          alert('Button clicked!') // Debug: verify click works
                          console.log('Done button clicked, index:', index)
                          const message = getRandomDoneMessage()
                          console.log('Setting message:', message)
                          setDoneMessage(message)
                          toggleDone(index)
                        }}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          border: doneRows.has(index) ? 'none' : '1px solid #ccc',
                          backgroundColor: doneRows.has(index) ? '#51cf66' : 'transparent',
                          color: doneRows.has(index) ? 'white' : '#333',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Done
                      </button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
        )}
      </Stack>
    </Container>
  )
}

export default App

