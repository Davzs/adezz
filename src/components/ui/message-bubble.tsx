import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: {
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      image?: string
    }
  }
  isCurrentUser: boolean
  showAvatar?: boolean
}

export function MessageBubble({
  message,
  isCurrentUser,
  showAvatar = true
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start space-x-2",
        isCurrentUser && "flex-row-reverse space-x-reverse"
      )}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.image} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-lg p-3 max-w-[80%]",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p className="text-xs mt-1 opacity-70">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}
