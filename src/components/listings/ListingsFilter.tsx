"use client";

import React from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const categories = [
  "All",
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Sports",
  "Other",
];

export default function ListingsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                const query = category === "All" 
                  ? "" 
                  : createQueryString("category", category);
                router.push(`/listings?${query}`);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${
                searchParams.get("category") === category
                  ? "bg-gray-100 font-medium"
                  : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min Price"
            className="w-full rounded-lg border p-2"
            onChange={(e) => {
              const query = createQueryString("minPrice", e.target.value);
              router.push(`/listings?${query}`);
            }}
            defaultValue={searchParams.get("minPrice") || ""}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="w-full rounded-lg border p-2"
            onChange={(e) => {
              const query = createQueryString("maxPrice", e.target.value);
              router.push(`/listings?${query}`);
            }}
            defaultValue={searchParams.get("maxPrice") || ""}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Sort By</h3>
        <select
          className="w-full rounded-lg border p-2"
          onChange={(e) => {
            const [sort, order] = e.target.value.split("-");
            let query = createQueryString("sort", sort);
            query = new URLSearchParams(query).toString();
            query += `&order=${order}`;
            router.push(`/listings?${query}`);
          }}
          defaultValue={`${searchParams.get("sort") || "createdAt"}-${searchParams.get("order") || "desc"}`}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
