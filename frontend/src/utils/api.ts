export async function fetchCategories() {
  const response = await fetch('http://localhost:5077/api/Finance/categories');
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function fetchTransactions(categoryId: string) {
  const response = await fetch(`http://localhost:5077/api/Finance/transactions/${encodeURIComponent(categoryId)}`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}