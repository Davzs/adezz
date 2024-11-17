import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Image as ImageIcon, Paperclip } from "lucide-react"

interface MessageComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  placeholder?: string
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Type your message..."
}: MessageComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSubmit()
      }
    }
  }

  return (
    <div className="border-t p-4 bg-background">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={true}
                title="Coming soon: Image upload"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={true}
                title="Coming soon: File attachments"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <span>Press Enter to send, Shift + Enter for new line</span>
          </div>
        </div>
        <Button
          className="flex-shrink-0"
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
