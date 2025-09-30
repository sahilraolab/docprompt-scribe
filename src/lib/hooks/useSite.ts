import { useQuery } from '@tanstack/react-query';
import { Item, Stock } from '@/types';

async function fetchItems(): Promise<Item[]> {
  const response = await fetch('/api/items');
  if (!response.ok) throw new Error('Failed to fetch items');
  const data = await response.json();
  return data.data;
}

async function fetchStock(): Promise<Stock[]> {
  const response = await fetch('/api/stock');
  if (!response.ok) throw new Error('Failed to fetch stock');
  const data = await response.json();
  return data.data;
}

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });
}

export function useStock() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: fetchStock,
  });
}
