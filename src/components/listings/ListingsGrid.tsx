"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, DollarSign, User, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  location: string;
  condition: string;
  seller: {
    name: string;
    email: string;
  };
}

export default function ListingsGrid() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/listings?${searchParams.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch listings");
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No listings found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your filters or create a new listing
        </p>
        <Link
          href="/listings/create"
          className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <Link
          key={listing._id}
          href={`/listings/${listing._id}`}
          className="block group"
        >
          <div className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0">
                <img
                  src={listing.images[0] || '/placeholder.png'}
                  alt={listing.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              {listing.condition && (
                <Badge variant="secondary" className="absolute top-2 right-2 z-20 bg-white/80 backdrop-blur-sm">
                  {listing.condition}
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-medium text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center text-lg font-bold text-primary">
                <DollarSign className="h-4 w-4 mr-1 text-primary/70" />
                {listing.price.toLocaleString()}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                  <span className="truncate">{listing.location}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1.5 shrink-0" />
                  <span className="truncate">Listed by {listing.seller.name}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
