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
  const [tableData, setTableData] = useState<TableRow[]>([])
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
    setTableData([])
    setDoneRows(new Set())

    if (!uploadedFile) {
      return
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      if (jsonData.length === 0) {
        setError('Excel file is empty')
        return
      }

      const headers = jsonData[0] as string[]
      const requiredIndices = REQUIRED_COLUMNS.map(col => {
        const index = headers.findIndex(h => h && h.trim().toLowerCase() === col.toLowerCase())
        if (index === -1) {
          throw new Error(`Required column "${col}" not found`)
        }
        return index
      })

      const parsedData: TableRow[] = jsonData.slice(1)
        .filter(row => row && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map(row => ({
          accountName: String(row[requiredIndices[0]] || ''),
          issueKey: String(row[requiredIndices[1]] || ''),
          issueSummary: String(row[requiredIndices[2]] || ''),
          workDescription: String(row[requiredIndices[3]] || ''),
          loggedHours: String(row[requiredIndices[4]] || ''),
          workDate: String(row[requiredIndices[5]] || ''),
          fullName: String(row[requiredIndices[6]] || '')
        }))
        .filter(row => row.accountName || row.issueKey || row.issueSummary)

      if (parsedData.length === 0) {
        setError('No valid data rows found in Excel file')
        return
      }

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

  const handleDoneClick = (index: number) => {
    const wasDone = doneRows.has(index)
    
    // Update done state
    setDoneRows(prev => {
      const newSet = new Set(prev)
      if (wasDone) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })

    // Show message only when marking as done (not when unmarking)
    if (!wasDone) {
      const message = getRandomDoneMessage()
      setDoneMessage(message)
    } else {
      setDoneMessage(null)
    }
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={1}>💰 Invoice Presenter</Title>
        
        {doneMessage && (
          <Alert
            data-testid="done-message-alert"
            color="green"
            icon={<IconCheck size={18} />}
            title="💰 Done!"
            onClose={() => setDoneMessage(null)}
            withCloseButton
          >
            {doneMessage}
          </Alert>
        )}
        
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
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
            horizontalSpacing="md"
            layout="fixed"
          >
            <Table.Thead>
              <Table.Tr>
                {REQUIRED_COLUMNS.map((col) => (
                  <Table.Th key={col} style={{ width: '12.5%' }}>{col}</Table.Th>
                ))}
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
                      data-row-index={index}
                      onClick={() => handleDoneClick(index)}
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
