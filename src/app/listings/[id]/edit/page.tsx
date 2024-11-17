'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ImagePlus, Trash2, Loader2 } from "lucide-react"

// Default image and placeholder
const DEFAULT_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image+Available'
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400?text=Image+Not+Found'

const categories = [
  "Electronics",
  "Computers",
  "Mobile Phones",
  "Furniture",
  "Home & Garden",
  "Clothing",
  "Fashion",
  "Books",
  "Sports",
  "Automotive",
  "Real Estate",
  "Jobs",
  "Services",
  "Other"
] as const

const listingFormSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot be longer than 100 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot be longer than 2000 characters"),
  price: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Price must be a valid number"),
  category: z.enum(categories, {
    required_error: "Please select a category",
  }),
  subcategory: z.string().optional(),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"], {
    required_error: "Please select a condition",
  }),
  location: z.string().min(1, "Location is required"),
  negotiable: z.boolean().default(false),
})

type ListingFormValues = z.infer<typeof listingFormSchema>

// Helper function to validate image URL
const getValidImageUrl = (url: string) => {
  if (!url) return DEFAULT_IMAGE
  if (url.startsWith('/')) return url
  try {
    new URL(url)
    return url
  } catch {
    return PLACEHOLDER_IMAGE
  }
}

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "Other",
      subcategory: "",
      condition: "Good",
      location: "",
      negotiable: false,
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/signin')
      return
    }

    const fetchListing = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/listings/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch listing')
        }

        // Check if user owns the listing
        if (data.userId !== session?.user?.id) {
          router.push('/listings')
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You can only edit your own listings",
          })
          return
        }

        // Set form values
        form.reset({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          category: data.category,
          subcategory: data.subcategory || "",
          condition: data.condition,
          location: data.location,
          negotiable: data.negotiable,
        })

        setImages(data.images || [])
      } catch (error: any) {
        console.error('Error fetching listing:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        })
        router.push('/listings')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchListing()
    }
  }, [params.id, session?.user?.id, router, toast, form, status])

  const onSubmit = async (values: ListingFormValues) => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          price: Number(values.price),
          images,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update listing')
      }

      toast({
        title: "Success",
        description: "Listing updated successfully",
      })

      router.push(`/listings/${params.id}`)
    } catch (error: any) {
      console.error('Error updating listing:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update listing. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid file type. Only JPEG, PNG and WebP images are allowed.",
      })
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size too large. Maximum size is 5MB.",
      })
      return
    }

    if (images.length >= 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Maximum 10 images allowed",
      })
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await response.json()
      setImages(prev => [...prev, data.url])
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload image. Please try again.",
      })
    } finally {
      setUploadingImage(false)
      // Reset the file input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    toast({
      title: "Success",
      description: "Image removed successfully",
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
          <CardDescription>
            Update your listing information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Like New">Like New</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={getValidImageUrl(url)}
                        alt={`Listing image ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded-lg object-cover w-full h-[100px]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingImage}
                      />
                      <div className="h-[100px] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <ImagePlus className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload up to 10 images. Click on an image to remove it.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
