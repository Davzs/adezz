import { Metadata } from "next";
import CreateListingForm from "@/components/listings/CreateListingForm";

export const metadata: Metadata = {
  title: "Create Listing",
  description: "Create a new listing",
};

export default function CreateListingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>
        <CreateListingForm />
      </div>
    </div>
  );
}
