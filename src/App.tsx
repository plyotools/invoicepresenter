import { useState, useCallback, useRef, useEffect } from 'react'
import { Stack, FileInput, Group, ActionIcon, Tooltip, Modal, Textarea, Button, Text, ScrollArea, TextInput } from '@mantine/core'
import { IconCopy, IconCheck, IconX } from '@tabler/icons-react'
import { getRandomDoneMessage, doneMessages, setDoneMessages } from './doneMessages'
import { parseExcelFile } from './utils/excelParser'
import { InvoiceRow } from './types'
import './App.css'

const SHEEP_REACTIONS = [
  'Bææææ! Ikkje pirk paa meg!',
  'Hei du! Eg beitar her!',
  'Slutt! Eg er ikkje ei leikesau!',
  'Ull deg vekk!',
  'Bæ! Det kitlar!',
  'Eg er eit seriøst rekneskapsdyr!',
  'Nei nei nei! Lat meg vera!',
  'Hjaalp! Nokon pirkar!',
  'Eg tel meg sjølv for aa sovna...',
  'Hev du ikkje ei faktura aa sjaa til?',
  'Bææ! Eg rapporterer dette!',
  'Eg er ein revisjons-sau, vis respekt!',
  'Slutt med det! Eg misser ulla!',
  'Du skal faa att for dette... bææ!',
]

const TRANSLATE_TOOLTIPS = [
  'Trykk for aa tyda denne gaata',
  'Lat Google tolka dette kraakerspraak',
  'Umset dette til menneskemaal',
  'Kva i alle dagar stend det her?',
  'Trykk for trolldomsomsetting',
  'Lat dei lærde tyda dette',
]

function BouncingSheep() {
  const sheepRef = useRef<HTMLDivElement>(null)
  const [bubble, setBubble] = useState<{ text: string; x: number; y: number } | null>(null)
  const posRef = useRef({ x: Math.random() * (window.innerWidth - 80), y: Math.random() * (window.innerHeight - 80) })
  const velRef = useRef({
    dx: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.3),
    dy: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.2)
  })
  const flipRef = useRef(false)
  const phaseRef = useRef(0)
  const wiggleRef = useRef(false)
  const wiggleEndRef = useRef(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const animate = () => {
      if (!sheepRef.current) return

      const now = Date.now()
      const isWiggling = wiggleRef.current && now < wiggleEndRef.current

      if (!isWiggling) {
        if (wiggleRef.current) wiggleRef.current = false

        posRef.current.x += velRef.current.dx
        posRef.current.y += velRef.current.dy
        phaseRef.current += 0.03

        if (posRef.current.x <= 0 || posRef.current.x >= window.innerWidth - 60) {
          velRef.current.dx = -velRef.current.dx
          flipRef.current = velRef.current.dx < 0
        }
        if (posRef.current.y <= 0 || posRef.current.y >= window.innerHeight - 60) {
          velRef.current.dy = -velRef.current.dy
        }

        const bob = Math.sin(phaseRef.current) * 4
        const tilt = Math.sin(phaseRef.current * 0.7) * 2

        sheepRef.current.style.left = `${posRef.current.x}px`
        sheepRef.current.style.top = `${posRef.current.y + bob}px`
        sheepRef.current.style.transform = `${flipRef.current ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${tilt}deg)`
        sheepRef.current.style.animation = ''
      } else {
        sheepRef.current.style.animation = 'sheepWiggle 0.5s ease-in-out infinite'
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  const handleTickle = () => {
    wiggleRef.current = true
    wiggleEndRef.current = Date.now() + 1500

    const text = SHEEP_REACTIONS[Math.floor(Math.random() * SHEEP_REACTIONS.length)]
    setBubble({ text, x: posRef.current.x, y: posRef.current.y - 50 })
    setTimeout(() => setBubble(null), 2500)
  }

  return (
    <>
      <div
        ref={sheepRef}
        className="sheep"
        onClick={handleTickle}
      >
        🐑
      </div>
      {bubble && (
        <div className="sheep-bubble" style={{ left: bubble.x - 40, top: bubble.y - 10 }}>
          {bubble.text}
        </div>
      )}
    </>
  )
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [tableData, setTableData] = useState<InvoiceRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [doneRows, setDoneRows] = useState<Set<number>>(new Set())
  const [floatingMessage, setFloatingMessage] = useState<string | null>(null)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
const [showBrideEmoji, setShowBrideEmoji] = useState<Set<number>>(new Set())
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          '--header-height',
          `${headerRef.current.offsetHeight}px`
        )
      }
    }
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [])

  const handleFileChange = async (file: File | null) => {
    setFile(file)
    setError(null)
    setTableData([])

    if (!file) return

    const result = await parseExcelFile(file)
    if (result.success && result.data) {
      setTableData(result.data)
    } else {
      setError(result.error || 'Filen let seg ikkje lesa, prøv att')
    }
  }

  const formatNorwegianDate = (dateStr: string) => {
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) return dateStr
    return parsed.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const openTranslate = (text: string) => {
    window.open(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`, '_blank')
  }

  const getRandomTooltip = () => TRANSLATE_TOOLTIPS[Math.floor(Math.random() * TRANSLATE_TOOLTIPS.length)]

  const handleRowDoneClick = useCallback((index: number) => {
    setDoneRows(prev => {
      const newDoneRows = new Set(prev)
      const isCurrentlyDone = newDoneRows.has(index)

      if (isCurrentlyDone) {
        newDoneRows.delete(index)
      } else {
        newDoneRows.add(index)

        setShowBrideEmoji(prev => new Set(prev).add(index))
        setTimeout(() => {
          setShowBrideEmoji(prev => {
            const updated = new Set(prev)
            updated.delete(index)
            return updated
          })
        }, 1000)

        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)

        const message = getRandomDoneMessage()
        setIsFadingOut(false)
        setFloatingMessage(message)

        messageTimeoutRef.current = setTimeout(() => {
          setIsFadingOut(true)
          fadeTimeoutRef.current = setTimeout(() => {
            setFloatingMessage(null)
            setIsFadingOut(false)
          }, 500)
        }, 5000)
      }

      return newDoneRows
    })
  }, [])

  const handleCopyClick = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const handleInvisibleAreaClick = useCallback(() => {
    clickCountRef.current += 1
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
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
    const cleanedValue = value.replace(/^\d+\.\s*/, '').trim()
    newEditing[index] = cleanedValue || value
    setEditingMessages(newEditing)
  }, [editingMessages])

  const handleAddMessages = useCallback(() => {
    if (!newMessagesText.trim()) return
    const lines = newMessagesText.split('\n').filter(line => line.trim())
    const cleanedMessages = lines.map(line => {
      let cleaned = line.trim()
      cleaned = cleaned.replace(/^\d+\.\s*/, '')
      cleaned = cleaned.replace(/^\d+\.\s*/, '')
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
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    }
  }, [])

  const totalHours = tableData.reduce((sum, row) => {
    const h = parseFloat(row.loggedHours)
    return sum + (isNaN(h) ? 0 : h)
  }, 0)

  return (
    <>
      <BouncingSheep />

      {/* Sticky header with title + done toast */}
      <div ref={headerRef} className="sticky-header" style={{ position: 'relative' }}>
        <Group justify="space-between" align="flex-start">
          <div>
            <h1 className="ledger-title">💰 O Store Rekneskapsbok</h1>
            <div className="ledger-subtitle">Anno MMXXV — Eit Oversyn yver Arbeid og Rekningar</div>
          </div>
          <div
            onClick={handleInvisibleAreaClick}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
            title="Trippeltrykk for aa styra meldingane"
          />
        </Group>

        {/* Done toast overlaid on header */}
        {floatingMessage && (
          <div className={`done-toast ${isFadingOut ? 'fade-out' : ''}`}>
            {floatingMessage}
          </div>
        )}
      </div>

      {/* Upload section */}
      <div className="upload-section">
        <label className="upload-label">Legg fram ditt rekneark, gode sjel</label>
        <FileInput
          placeholder="Vel ei fil fraa skrivebordet (.xlsx, .xls)"
          accept=".xlsx,.xls"
          value={file}
          onChange={handleFileChange}
          styles={{
            input: {
              fontFamily: "'IM Fell English', serif",
              background: 'rgba(245, 230, 200, 0.6)',
              border: '1.5px solid rgba(120, 80, 60, 0.25)',
              color: '#5c2e14',
              borderRadius: 4,
            }
          }}
        />
      </div>

      {error && (
        <div className="ledger-error">{error}</div>
      )}

      {tableData.length > 0 && (
        <>
          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-account">Kven Betalar</th>
                  <th className="col-date">Dato</th>
                  <th className="col-summary">Kva Gjeld Saka</th>
                  <th className="col-description">Kva Vart Gjort</th>
                  <th className="col-hours">Timar</th>
                  <th className="col-name">Kven Sveitte</th>
                  <th className="col-issue">Saksnøkkel</th>
                  <th className="col-done">Ferdig</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => {
                  const isDone = doneRows.has(index)
                  const showEmoji = showBrideEmoji.has(index)
                  return (
                    <tr key={index} className={isDone ? 'row-done' : ''}>
                      <td style={{ fontWeight: 600 }}>{row.accountName}</td>
                      <td>{formatNorwegianDate(row.workDate)}</td>
                      <td>{row.issueSummary}</td>
                      <td style={{ position: 'relative' }}>
                        <Group gap="xs" wrap="nowrap" align="flex-start">
                          <Tooltip label={getRandomTooltip()} position="top">
                            <span
                              className="work-desc-link"
                              onClick={() => openTranslate(row.workDescription)}
                            >
                              {row.workDescription}
                            </span>
                          </Tooltip>
                          <Tooltip label={copiedIndex === index ? 'Kopiert!' : 'Kopier teksten'}>
                            <ActionIcon
                              variant="subtle"
                              size="sm"
                              onClick={() => handleCopyClick(row.workDescription, index)}
                              style={{ flexShrink: 0, opacity: 0.5 }}
                            >
                              {copiedIndex === index ? (
                                <IconCheck size={14} color="#5a7a44" />
                              ) : (
                                <IconCopy size={14} color="#8a6b50" />
                              )}
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 500 }}>{row.loggedHours}</td>
                      <td>{row.fullName}</td>
                      <td>
                        {row.issueKey ? (
                          <a
                            href={`https://plyolabs.atlassian.net/browse/${row.issueKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="issue-link"
                          >
                            {row.issueKey}
                          </a>
                        ) : ''}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`done-btn ${isDone ? 'is-done' : ''}`}
                          onClick={() => handleRowDoneClick(index)}
                        >
                          {showEmoji ? '👰' : isDone ? '✓' : 'Ferdig'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="total-hours">
            Summa Summarum: {totalHours.toFixed(2)} timar
          </div>
        </>
      )}

      {/* Message management modal */}
      <Modal
        opened={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        title="Styresmakta yver Meldingane"
        fullScreen
      >
        <Stack gap="md" style={{ height: 'calc(100vh - 120px)' }}>
          <Text size="sm" c="dimmed">
            {editingMessages.length} meldingar i samlinga
          </Text>
          <ScrollArea h="calc(100vh - 350px)">
            <Stack gap="xs">
              {editingMessages.map((message, index) => (
                <Group key={index} justify="flex-start" align="center" wrap="nowrap" gap="xs">
                  <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveMessage(index)} size="sm">
                    <IconX size={16} />
                  </ActionIcon>
                  <TextInput
                    value={message}
                    onChange={(e) => handleEditMessageChange(index, e.currentTarget.value)}
                    style={{ flex: 1 }}
                    size="sm"
                  />
                  <Button size="xs" onClick={() => handleSaveMessage(index)} disabled={message === messagesList[index]}>
                    Lagra
                  </Button>
                </Group>
              ))}
            </Stack>
          </ScrollArea>
          <div>
            <Text size="sm" fw={500} mb="xs">Legg til nye meldingar (ei per lina):</Text>
            <Textarea
              value={newMessagesText}
              onChange={(e) => setNewMessagesText(e.currentTarget.value)}
              placeholder="Skriv meldingar her..."
              rows={4}
              mb="xs"
            />
            <Button onClick={handleAddMessages} disabled={!newMessagesText.trim()}>
              Legg til
            </Button>
          </div>
        </Stack>
      </Modal>
    </>
  )
}

export default App
