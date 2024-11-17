import * as React from "react"
import { MessageBubble } from "@/components/ui/message-bubble"

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
    image?: string
  }
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({
  messages,
  currentUserId
}: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const isFirstRender = React.useRef(true)
  const previousMessagesLength = React.useRef(messages.length)

  React.useEffect(() => {
    // Only scroll to bottom when new messages are added, not on first load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only scroll if messages were added (not on initial load)
    if (messages.length > previousMessagesLength.current) {
      scrollToBottom()
    }
    
    previousMessagesLength.current = messages.length
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = new Date(message.createdAt).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className="flex flex-col space-y-6 p-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
              {date === new Date().toLocaleDateString()
                ? "Today"
                : date === new Date(Date.now() - 86400000).toLocaleDateString()
                ? "Yesterday"
                : date}
            </div>
          </div>
          {dateMessages.map((message, index) => {
            const isCurrentUser = message.sender.id === currentUserId
            const showAvatar =
              index === 0 ||
              dateMessages[index - 1].sender.id !== message.sender.id

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={isCurrentUser}
                showAvatar={showAvatar}
              />
            )
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
