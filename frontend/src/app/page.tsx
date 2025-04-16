'use client';

import { useState, useEffect } from 'react';
import { PieChartComponent } from '../components/pieChart';
import { BarChartComponent } from '../components/barChart';
import { TransactionDetails } from '../components/transactionDetails';
import { fetchCategories, fetchTransactions } from '../utils/api';

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMasked, setIsMasked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<TransactionDetail[]>([]);
  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});

  useEffect(() => {
    fetchCategories().then((categories) => {
      const mapping: CategoryMap = {};
      categories.forEach((cat) => {
        mapping[cat.name.toLowerCase()] = cat.id;
      });
      setCategoryMap(mapping);
    });
  }, []);

  const handleCategoryClick = async (categoryNameOrId: string) => {
    setLoading(true);
    try {
      const categoryId = categoryMap[categoryNameOrId.toLowerCase()] || categoryNameOrId;
      const data = await fetchTransactions(categoryId);
      setCategoryTransactions(data.transactions);
      setSelectedCategory(categoryNameOrId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setLoading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5077/api/Finance/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">AiBank Analysis</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {isMasked ? 'Show Values' : 'Hide Values'}
            </button>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-64 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700"></div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChartComponent analysis={analysis} onClick={handleCategoryClick} isMasked={isMasked} />
              <BarChartComponent analysis={analysis} isMasked={isMasked} />
            </div>
            {selectedCategory && <TransactionDetails category={selectedCategory} transactions={categoryTransactions} isMasked={isMasked} />}
          </div>
        )}
      </div>
    </main>
  );
}
