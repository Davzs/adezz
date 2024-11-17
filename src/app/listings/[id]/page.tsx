'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Share2, MapPin, DollarSign, ImageIcon, MessageSquare } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/LoadingSpinner"

// Default image and placeholder
const DEFAULT_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image+Available'
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400?text=Image+Not+Found'

// Helper function to check if a URL is relative
const isRelativeUrl = (url: string) => {
  return url?.startsWith('/');
}

// Helper function to validate image URL
const getValidImageUrl = (url: string) => {
  if (!url) return DEFAULT_IMAGE;
  if (isRelativeUrl(url)) return url;

  try {
    new URL(url);
    return url;
  } catch {
    return PLACEHOLDER_IMAGE;
  }
}

export default function ListingPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [listing, setListing] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [params.id])

  const fetchListing = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch(`/api/listings/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch listing')
      }
      
      const data = await response.json()
      setListing(data)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message the seller",
        variant: "destructive",
      })
      router.push('/auth/signin')
      return
    }

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: listing.userId,
          listingId: listing._id,
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller",
      })

      setMessage("")
      setIsMessageDialogOpen(false)
      router.push('/dashboard/messages')
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

  const handleSave = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save listings",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Add logic to save the listing here
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading listing details..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <CardTitle className="text-red-500 mb-2">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {isSaving && <LoadingSpinner text="Saving listing..." />}
      {isSending && <LoadingSpinner text="Sending message..." />}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images Section */}
        <div className="space-y-4">
          <Carousel className="w-full">
            <CarouselContent>
              {listing.images?.length > 0 ? (
                listing.images.map((image: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square">
                      <Image
                        src={getValidImageUrl(image)}
                        alt={`${listing.title} - Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e: any) => {
                          e.target.src = PLACEHOLDER_IMAGE
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="relative aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {listing.images?.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {listing.price.toLocaleString()}
              </div>
              {listing.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                </div>
              )}
            </div>
          </div>

          {listing.condition && (
            <Badge variant="secondary" className="text-sm">
              {listing.condition}
            </Badge>
          )}

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={listing.userImage} />
                <AvatarFallback>{listing.userName?.[0] || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{listing.userName}</p>
                <p className="text-sm text-muted-foreground">
                  Listed {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => setIsMessageDialogOpen(true)}
              disabled={session?.user?.id === listing.userId}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Seller
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSave}
            >
              <Heart
                className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`}
              />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.share({
                  title: listing.title,
                  text: listing.description,
                  url: window.location.href,
                })
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Seller</DialogTitle>
            <DialogDescription>
              Send a message to the seller about this listing
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in your listing..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMessageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
            >
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}