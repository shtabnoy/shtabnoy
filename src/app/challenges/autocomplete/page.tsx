'use client';

import Autocomplete from '@/components/Autocomplete';

type Product = {
  id: 1;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
};

export default function AutocompletePage() {
  return (
    <Autocomplete<Product>
      onSearch={async (query, signal) => {
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${query}`,
          {
            signal,
          },
        );
        const parsed = await res.json();
        return parsed.products;
      }}
      getKey={(item) => item.id}
      renderItem={(item) => <span>{item.title}</span>}
      onSelect={(item) => {
        console.log('selecting... ', item.id);
      }}
      placeholder="Search assets..."
    />
  );
}
