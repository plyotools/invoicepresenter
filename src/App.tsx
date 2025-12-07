import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Stack, Title, FileInput, Table, Alert, Group, ActionIcon, Tooltip, Switch, Modal, Textarea, Button, Text, ScrollArea, TextInput } from '@mantine/core'
import { IconCopy, IconCheck, IconX } from '@tabler/icons-react'
import { getRandomDoneMessage, doneMessages, setDoneMessages } from './doneMessages'
import { parseExcelFile } from './utils/excelParser'
import { InvoiceRow } from './types'
import './App.css'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [tableData, setTableData] = useState<InvoiceRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [doneRows, setDoneRows] = useState<Set<number>>(new Set())
  const [floatingMessage, setFloatingMessage] = useState<string | null>(null)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [messagesEnabled, setMessagesEnabled] = useState(true)
  const [showBrideEmoji, setShowBrideEmoji] = useState<Set<number>>(new Set())
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [messagesModalOpen, setMessagesModalOpen] = useState(false)
  const [messagesList, setMessagesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('doneMessages')
    return saved ? JSON.parse(saved) : doneMessages
  })
  const [editingMessages, setEditingMessages] = useState<string[]>(() => {
    const saved = localStorage.getItem('doneMessages')
    return saved ? JSON.parse(saved) : doneMessages
  })
  const [newMessagesText, setNewMessagesText] = useState('')
  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleFileChange = async (file: File | null) => {
    setFile(file)
    setError(null)
    setTableData([])

    if (!file) {
      return
    }

    const result = await parseExcelFile(file)
    
    if (result.success && result.data) {
      setTableData(result.data)
      setError(null)
    } else {
      setError(result.error || 'Kunne ikke lese Excel-filen')
      setTableData([])
    }
  }

  const handleRowDoneClick = useCallback((index: number) => {
    setDoneRows(prev => {
      const newDoneRows = new Set(prev)
      const isCurrentlyDone = newDoneRows.has(index)
      
      if (isCurrentlyDone) {
        newDoneRows.delete(index)
      } else {
        newDoneRows.add(index)
        
        // Vis brud-emoji i 1 sekund
        setShowBrideEmoji(prev => new Set(prev).add(index))
        setTimeout(() => {
          setShowBrideEmoji(prev => {
            const updated = new Set(prev)
            updated.delete(index)
            return updated
          })
        }, 1000)
        
        // Rydde opp i tidligere timeouts hvis de eksisterer
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current)
        }
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current)
        }
        
        // Rydde opp i tidligere melding først
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current)
          messageTimeoutRef.current = null
        }
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current)
          fadeTimeoutRef.current = null
        }
        
        // Vis melding alltid i 5 sekunder
        const message = getRandomDoneMessage()
        setIsFadingOut(false)
        setFloatingMessage(message)
        
        // Start fade out after 5 seconds, remove after fade completes
        messageTimeoutRef.current = setTimeout(() => {
          setIsFadingOut(true)
          fadeTimeoutRef.current = setTimeout(() => {
            setFloatingMessage(null)
            setIsFadingOut(false)
            messageTimeoutRef.current = null
            fadeTimeoutRef.current = null
          }, 500) // Fade duration
        }, 5000)
      }
      
      return newDoneRows
    })
  }, [])

  const handleCopyClick = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => {
        setCopiedIndex(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const handleInvisibleAreaClick = useCallback(() => {
    clickCountRef.current += 1
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) {
        setMessagesModalOpen(true)
        const saved = localStorage.getItem('doneMessages')
        const currentMessages = saved ? JSON.parse(saved) : doneMessages
        setMessagesList([...currentMessages])
        setEditingMessages([...currentMessages])
      }
      clickCountRef.current = 0
    }, 500)
  }, [])

  const handleSaveAllMessages = useCallback(() => {
    // Strip numbers from all messages before saving
    const cleanedMessages = editingMessages.map(msg => msg.replace(/^\d+\.\s*/, '').trim())
    setMessagesList(cleanedMessages)
    setEditingMessages(cleanedMessages)
    setDoneMessages(cleanedMessages)
    localStorage.setItem('doneMessages', JSON.stringify(cleanedMessages))
  }, [editingMessages])

  const handleRemoveMessage = useCallback((index: number) => {
    const newMessages = messagesList.filter((_, i) => i !== index)
    const newEditing = editingMessages.filter((_, i) => i !== index)
    setMessagesList(newMessages)
    setEditingMessages(newEditing)
    setDoneMessages(newMessages)
    localStorage.setItem('doneMessages', JSON.stringify(newMessages))
  }, [messagesList, editingMessages])

  const handleSaveMessage = useCallback((index: number) => {
    const newMessages = [...messagesList]
    // Strip numbers from the message if present
    const cleanedMessage = editingMessages[index].replace(/^\d+\.\s*/, '').trim()
    newMessages[index] = cleanedMessage
    const newEditing = [...editingMessages]
    newEditing[index] = cleanedMessage
    setMessagesList(newMessages)
    setEditingMessages(newEditing)
    setDoneMessages(newMessages)
    localStorage.setItem('doneMessages', JSON.stringify(newMessages))
  }, [messagesList, editingMessages])

  const handleEditMessageChange = useCallback((index: number, value: string) => {
    const newEditing = [...editingMessages]
    // Strip numbers if user types them
    const cleanedValue = value.replace(/^\d+\.\s*/, '').trim()
    newEditing[index] = cleanedValue || value
    setEditingMessages(newEditing)
  }, [editingMessages])

  const handleAddMessages = useCallback(() => {
    if (!newMessagesText.trim()) return
    
    const lines = newMessagesText.split('\n').filter(line => line.trim())
    const cleanedMessages = lines.map(line => {
      // Remove leading numbers like "1. ", "2. ", "123. " etc. - handle multiple patterns
      let cleaned = line.trim()
      // Remove number patterns: "1. ", "123. ", "1.", etc.
      cleaned = cleaned.replace(/^\d+\.\s*/, '')
      cleaned = cleaned.replace(/^\d+\.\s*/, '') // Run twice to catch edge cases
      return cleaned.trim()
    }).filter(msg => msg.length > 0)
    
    const updatedMessages = [...messagesList, ...cleanedMessages]
    const updatedEditing = [...editingMessages, ...cleanedMessages]
    setMessagesList(updatedMessages)
    setEditingMessages(updatedEditing)
    setDoneMessages(updatedMessages)
    localStorage.setItem('doneMessages', JSON.stringify(updatedMessages))
    setNewMessagesText('')
  }, [newMessagesText, messagesList, editingMessages])

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div style={{ margin: '24px 30px 0 30px', width: 'calc(100% - 60px)' }}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Title order={1}>Fakturering</Title>
          <Switch
            label="Vis meldinger"
            checked={messagesEnabled}
            onChange={(event) => setMessagesEnabled(event.currentTarget.checked)}
            style={{ marginTop: '8px' }}
          />
        </Group>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <FileInput
              label="Last opp Excel-fil"
              placeholder="Velg .xlsx eller .xls fil"
              accept=".xlsx,.xls"
              value={file}
              onChange={handleFileChange}
            />
            <div
              onClick={handleInvisibleAreaClick}
              style={{
                position: 'absolute',
                right: '0px',
                top: '0px',
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="Triple-click to manage messages"
            />
          </div>
        </div>

        {error && (
          <Alert color="red" title="Feil">
            {error}
          </Alert>
        )}

        {tableData.length > 0 && (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <Table striped highlightOnHover withTableBorder withColumnBorders style={{ width: '100%', tableLayout: 'fixed' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kontonavn</Table.Th>
                  <Table.Th style={{ width: '8%' }}>Saksnummer</Table.Th>
                  <Table.Th>Sakssammendrag</Table.Th>
                  <Table.Th>Arbeidsbeskrivelse</Table.Th>
                  <Table.Th style={{ width: '6%' }}>Timer</Table.Th>
                  <Table.Th>Arbeidsdato</Table.Th>
                  <Table.Th>Fullt navn</Table.Th>
                  <Table.Th style={{ textAlign: 'right', width: '8%' }}>Ferdig</Table.Th>
                </Table.Tr>
              </Table.Thead>
            <Table.Tbody>
              {tableData.map((row, index) => {
                const isDone = doneRows.has(index)
                const showEmoji = showBrideEmoji.has(index)
                return (
                  <Table.Tr 
                    key={index}
                    style={{ 
                      backgroundColor: isDone ? '#e8f5e9' : undefined
                    }}
                  >
                    <Table.Td>{row.accountName}</Table.Td>
                    <Table.Td>
                      {row.issueKey ? (
                        <a
                          href={`https://plyolabs.atlassian.net/browse/${row.issueKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#228be6', textDecoration: 'underline' }}
                        >
                          {row.issueKey}
                        </a>
                      ) : (
                        row.issueKey
                      )}
                    </Table.Td>
                    <Table.Td>{row.issueSummary}</Table.Td>
                    <Table.Td
                      onClick={() => handleCopyClick(row.workDescription, index)}
                      style={{
                        cursor: 'pointer',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        position: 'relative',
                        padding: '8px',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        verticalAlign: 'top'
                      }}
                      title="Klikk for å kopiere"
                    >
                      <div style={{ paddingRight: '24px', minHeight: '20px' }}>
                        {row.workDescription}
                      </div>
                      <div style={{ position: 'absolute', top: '8px', right: '8px', pointerEvents: 'none', zIndex: 11 }}>
                        <Tooltip label={copiedIndex === index ? 'Kopiert!' : 'Klikk for å kopiere'}>
                          <span>
                            {copiedIndex === index ? <IconCheck size={16} color="#51cf66" /> : <IconCopy size={16} />}
                          </span>
                        </Tooltip>
                      </div>
                    </Table.Td>
                    <Table.Td>{row.loggedHours}</Table.Td>
                    <Table.Td>{row.workDate}</Table.Td>
                    <Table.Td>{row.fullName}</Table.Td>
                    <Table.Td style={{ position: 'relative', zIndex: 2, textAlign: 'right', width: '8%' }}>
                      <button
                        data-testid={`done-button-${index}`}
                        onClick={() => handleRowDoneClick(index)}
                        style={{
                          backgroundColor: isDone ? '#51cf66' : 'transparent',
                          color: isDone ? 'white' : '#333',
                          border: isDone ? 'none' : '1px solid #ccc',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          position: 'relative',
                          zIndex: 3,
                          marginLeft: 'auto',
                          display: 'block',
                          minWidth: '70px',
                          width: '70px',
                          whiteSpace: 'nowrap',
                          textAlign: 'center'
                        }}
                      >
                        {showEmoji ? '👰' : 'Ferdig'}
                      </button>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
          </div>
        )}

      </Stack>
      
      {floatingMessage && (
        <div className={`floating-message ${isFadingOut ? 'fade-out' : ''}`}>
          {floatingMessage}
        </div>
      )}

      <Modal
        opened={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        title="Administrer meldinger"
        fullScreen
      >
        <Stack gap="md" style={{ height: 'calc(100vh - 120px)' }}>
          <Text size="sm" c="dimmed">
            {editingMessages.length} meldinger
          </Text>
          <ScrollArea h="calc(100vh - 350px)">
            <Stack gap="xs">
              {editingMessages.map((message, index) => (
                <Group key={index} justify="flex-start" align="center" wrap="nowrap" gap="xs">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => handleRemoveMessage(index)}
                    size="sm"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                  <TextInput
                    value={message}
                    onChange={(e) => handleEditMessageChange(index, e.currentTarget.value)}
                    style={{ flex: 1 }}
                    size="sm"
                  />
                  <Button
                    size="xs"
                    onClick={() => handleSaveMessage(index)}
                    disabled={message === messagesList[index]}
                  >
                    Lagre
                  </Button>
                </Group>
              ))}
            </Stack>
          </ScrollArea>

          <div>
            <Text size="sm" fw={500} mb="xs">Legg til nye meldinger (én per linje, nummerering fjernes automatisk):</Text>
            <Textarea
              value={newMessagesText}
              onChange={(e) => setNewMessagesText(e.currentTarget.value)}
              placeholder="1. Første melding&#10;2. Andre melding&#10;3. Tredje melding"
              rows={4}
              mb="xs"
            />
            <Button onClick={handleAddMessages} disabled={!newMessagesText.trim()}>
              Legg til
            </Button>
          </div>
        </Stack>
      </Modal>
    </div>
  )
}

export default App

