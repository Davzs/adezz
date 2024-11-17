import { Metadata } from "next";
import ListingsGrid from "@/components/listings/ListingsGrid";
import ListingsFilter from "@/components/listings/ListingsFilter";

export const metadata: Metadata = {
  title: "Listings",
  description: "Browse all listings",
};

export default function ListingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <ListingsFilter />
        </aside>
        <main className="flex-1">
          <ListingsGrid />
        </main>
      </div>
    </div>
  );
}
