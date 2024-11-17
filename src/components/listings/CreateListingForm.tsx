"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required").transform((val) => parseFloat(val)),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"]),
});

type ListingFormData = z.infer<typeof listingSchema>;

const categories = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Sports",
  "Other",
];

export default function CreateListingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  });

  const onSubmit = async (data: ListingFormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      console.log('Submitting data:', data);

      // TODO: Implement image upload to cloud storage
      const imageUrls = ["placeholder-image-url"];

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: imageUrls,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.message || "Failed to create listing");
      }

      console.log('Listing created:', result);
      router.push("/listings");
      router.refresh();
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setError(error.message || "Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          {...register("title")}
          type="text"
          className="mt-1 block w-full rounded-md border p-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 block w-full rounded-md border p-2"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Price
        </label>
        <input
          {...register("price")}
          type="number"
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border p-2"
        />
        {errors.price && (
          <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          {...register("category")}
          className="mt-1 block w-full rounded-md border p-2"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium">
          Location
        </label>
        <input
          {...register("location")}
          type="text"
          className="mt-1 block w-full rounded-md border p-2"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="condition" className="block text-sm font-medium">
          Condition
        </label>
        <select
          {...register("condition")}
          className="mt-1 block w-full rounded-md border p-2"
        >
          <option value="">Select condition</option>
          {["New", "Like New", "Good", "Fair", "Poor"].map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
        {errors.condition && (
          <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setImages(Array.from(e.target.files));
            }
          }}
          className="mt-1 block w-full"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white rounded-lg p-2 hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
}
