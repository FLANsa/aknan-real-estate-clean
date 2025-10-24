'use client';
import { useEffect, useState } from 'react';
import { useAdminMapStore } from '@/store/adminMapStore';

interface Metrics {
  counts: {
    available: number;
    reserved: number;
    sold: number;
  };
  totalArea: number;
  avgArea: number;
  totalCount: number;
}

export default function StatsBar() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const activeProjectId = useAdminMapStore(s=>s.activeProjectId);

  useEffect(()=>{
    fetchMetrics();
  },[activeProjectId]);

  async function fetchMetrics() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !metrics) {
    return <div className="flex gap-4 text-sm">جاري التحميل...</div>;
  }

  return (
    <div className="flex gap-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span>متاح: {metrics.counts.available}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span>محجوز: {metrics.counts.reserved}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span>مباع: {metrics.counts.sold}</span>
      </div>
      
      <div className="border-l pl-4">
        <span>المساحة الإجمالية: {metrics.totalArea.toLocaleString()} م²</span>
      </div>
      
      <div className="border-l pl-4">
        <span>متوسط المساحة: {metrics.avgArea.toLocaleString()} م²</span>
      </div>
      
      <div className="border-l pl-4">
        <span>إجمالي القطع: {metrics.totalCount}</span>
      </div>
    </div>
  );
}

