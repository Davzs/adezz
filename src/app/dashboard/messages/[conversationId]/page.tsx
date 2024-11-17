'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageList } from "@/components/ui/message-list"
import { MessageComposer } from "@/components/ui/message-composer"
import { ArrowLeft, DollarSign } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  content: string;
  metadata?: {
    listingId?: string;
  };
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    email: string;
    image: string;
  }[];
  listing?: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
  updatedAt: string;
}

export default function ConversationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      Promise.all([
        fetchConversation(),
        fetchMessages()
      ])
    }
  }, [session, status, router])

  // Reset scroll position when messages are loaded
  useEffect(() => {
    if (!isLoading) {
      // Ensure we're at the top when messages first load
      window.requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = 0;
        }
      });
    }
  }, [isLoading])

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${params.conversationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversation')
      }
      const data = await response.json()
      setConversation(data)
    } catch (err: any) {
      console.error('Error fetching conversation:', err)
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load conversation details",
        variant: "destructive",
      })
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${params.conversationId}/messages`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data)
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true)
      const response = await fetch(`/api/conversations/${params.conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages([...messages, data.message])
      setNewMessage("")
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.participants.find(p => p.id !== session?.user?.id) || conversation.participants[0];
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg p-4 w-[600px] h-24" />
          ))}
        </div>
      </div>
    )
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => router.push('/dashboard/messages')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
          {otherParticipant && (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={otherParticipant.image} />
                <AvatarFallback>{otherParticipant.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{otherParticipant.name}</h2>
              </div>
            </div>
          )}
        </div>

        {conversation?.listing && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                  <Image
                    src={conversation.listing.image}
                    alt={conversation.listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{conversation.listing.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {conversation.listing.price.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/listings/${conversation.listing?.id}`)}
                >
                  View Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto" id="messages-container">
              <MessageList
                messages={messages}
                currentUserId={session?.user?.id || ''}
              />
            </div>
            <MessageComposer
              value={newMessage}
              onChange={setNewMessage}
              onSubmit={handleSendMessage}
              isLoading={isSending}
              placeholder="Type your message..."
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
