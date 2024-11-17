'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Share2, MapPin, DollarSign } from 'lucide-react'

export function BlockPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  // In a real application, you would fetch this data based on the listing ID
  const listing = {
    id: params.id,
    title: "Vintage Leather Armchair",
    description: "Beautiful vintage leather armchair in excellent condition. Perfect for adding a touch of classic elegance to any room.",
    price: 299.99,
    location: "New York, NY",
    datePosted: "2023-06-15",
    category: "Furniture",
    condition: "Used - Like New",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    seller: {
      name: "Jane Doe",
      image: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      memberSince: "2022",
    },
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    // In a real application, you would send a request to your API to save/unsave the listing
  }

  const handleShare = () => {
    // In a real application, you would implement sharing functionality
    console.log("Sharing listing:", listing.id)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {listing.images.map((src, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Image
                      src={src}
                      alt={`${listing.title} - Image ${index + 1}`}
                      width={600}
                      height={400}
                      className="rounded-lg object-cover w-full h-[400px]"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{listing.title}</CardTitle>
                  <CardDescription>{listing.category}</CardDescription>
                </div>
                <Badge variant="secondary">{listing.condition}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">${listing.price.toFixed(2)}</p>
              <p className="mb-4">{listing.description}</p>
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Posted on {listing.datePosted}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Contact Seller</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact Seller</DialogTitle>
                    <DialogDescription>Send a message to the seller about this listing.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="message" className="text-right">Message</Label>
                      <Textarea id="message" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Send Message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleSave}>
                  <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={listing.seller.image} alt={listing.seller.name} />
                  <AvatarFallback>{listing.seller.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{listing.seller.name}</p>
                  <p className="text-sm text-muted-foreground">Member since {listing.seller.memberSince}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-xl font-bold">{listing.seller.rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(listing.seller.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}