import { useState, useEffect } from 'react'
import { Container, Title, Stack } from '@mantine/core'
import { getRandomDoneMessage } from './doneMessages'

function App() {
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

  const handleDoneClick = () => {
    const message = getRandomDoneMessage()
    setDoneMessage(message)
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={1}>💰 Invoice Presenter</Title>
        
        {doneMessage && (
          <div
            data-testid="done-message-alert"
            style={{
              padding: '12px 16px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              color: '#155724',
              marginBottom: '16px'
            }}
          >
            <strong>💰 Done!</strong> {doneMessage}
          </div>
        )}
        
        <button
          type="button"
          data-testid="done-button"
          onClick={handleDoneClick}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            border: '1px solid #ccc',
            backgroundColor: '#51cf66',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Done
        </button>
      </Stack>
    </Container>
  )
}

export default App
