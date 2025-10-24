'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Parcel } from '@/types/parcels';

export default function ParcelForm({ parcelId, onDone }:{
  parcelId: string|null; onDone:()=>void;
}) {
  const [form, setForm] = useState<Partial<Parcel>>({
    status:'available',
    useManualMetrics:true,
    dimensions:{ shape:'custom' },
  });

  useEffect(()=>{
    (async ()=>{
      if (!parcelId) return;
      const res = await fetch(`/api/admin/parcels?id=${parcelId}`);
      const data = await res.json();
      setForm(data.parcel);
    })();
  },[parcelId]);

  const rectangle = useMemo(()=>{
    if (form.dimensions?.shape!=='rectangle') return null;
    const L = Number(form.dimensions?.lengthM ?? 0);
    const W = Number(form.dimensions?.widthM ?? 0);
    if (!L || !W) return null;
    return { area:+(L*W).toFixed(2), perimeter:+(2*(L+W)).toFixed(2) };
  },[form.dimensions]);

  const manualArea = form.useManualMetrics
    ? (form.dimensions?.shape==='rectangle' && rectangle ? rectangle.area : Number(form.manualAreaSqm ?? 0))
    : undefined;

  const manualPerimeter = form.useManualMetrics
    ? (form.dimensions?.shape==='rectangle' && rectangle ? rectangle.perimeter : Number(form.manualPerimeterM ?? 0))
    : undefined;

  async function save() {
    const method = form.id ? 'PATCH' : 'POST';
    const url = form.id ? `/api/admin/parcels/${form.id}` : `/api/admin/parcels`;
    const body = {
      ...form,
      manualAreaSqm: form.useManualMetrics ? (manualArea ?? null) : null,
      manualPerimeterM: form.useManualMetrics ? (manualPerimeter ?? null) : null,
    };
    const r = await fetch(url, { method, body: JSON.stringify(body) });
    if (r.ok) onDone();
  }

  return (
    <div className="rounded-2xl border p-3 space-y-3 bg-white/5">
      <div className="flex items-center gap-2">
        <input type="checkbox"
          checked={!!form.useManualMetrics}
          onChange={(e)=>setForm(s=>({...s, useManualMetrics:e.target.checked}))}/>
        <span>إدخال المساحة والمحيط يدويًا</span>
      </div>

      {form.useManualMetrics && (
        <>
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded ${form.dimensions?.shape==='custom'?'bg-white/10':''}`}
              onClick={()=>setForm(s=>({...s, dimensions:{shape:'custom'}}))}>مخصص</button>
            <button className={`px-3 py-1 rounded ${form.dimensions?.shape==='rectangle'?'bg-white/10':''}`}
              onClick={()=>setForm(s=>({...s, dimensions:{shape:'rectangle', lengthM:null, widthM:null}}))}>مستطيل</button>
          </div>

          {form.dimensions?.shape==='rectangle' ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span>الطول (م)</span>
                <input type="number" step="0.01" className="w-full rounded border px-2 py-1"
                  value={form.dimensions?.lengthM ?? '' }
                  onChange={(e)=>setForm(s=>({...s, dimensions:{...s.dimensions!, shape:'rectangle', lengthM:+e.target.value||null, widthM:s.dimensions?.widthM ?? null}}))}
                />
              </label>
              <label className="space-y-1">
                <span>العرض (م)</span>
                <input type="number" step="0.01" className="w-full rounded border px-2 py-1"
                  value={form.dimensions?.widthM ?? '' }
                  onChange={(e)=>setForm(s=>({...s, dimensions:{...s.dimensions!, shape:'rectangle', widthM:+e.target.value||null, lengthM:s.dimensions?.lengthM ?? null}}))}
                />
              </label>

              <div className="col-span-2 text-sm opacity-80">
                {rectangle ? (
                  <div className="flex gap-6">
                    <div>المساحة المحسوبة: <b>{rectangle.area}</b> م²</div>
                    <div>المحيط المحسوب: <b>{rectangle.perimeter}</b> م</div>
                  </div>
                ) : <em>أدخل الطول والعرض لحساب المساحة/المحيط.</em>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span>المساحة (م²)</span>
                <input type="number" step="0.01" className="w-full rounded border px-2 py-1"
                  value={form.manualAreaSqm ?? '' }
                  onChange={(e)=>setForm(s=>({...s, manualAreaSqm:+e.target.value||null}))}/>
              </label>
              <label className="space-y-1">
                <span>المحيط (م)</span>
                <input type="number" step="0.01" className="w-full rounded border px-2 py-1"
                  value={form.manualPerimeterM ?? '' }
                  onChange={(e)=>setForm(s=>({...s, manualPerimeterM:+e.target.value||null}))}/>
              </label>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span>اسم/رقم القطعة</span>
          <input className="w-full rounded border px-2 py-1"
            value={form.name ?? ''} onChange={(e)=>setForm(s=>({...s, name:e.target.value}))}/>
        </label>
        <label className="space-y-1">
          <span>الحالة</span>
          <select className="w-full rounded border px-2 py-1"
            value={form.status ?? 'available'}
            onChange={(e)=>setForm(s=>({...s, status:e.target.value as any}))}>
            <option value="available">متاحة</option>
            <option value="reserved">محجوزة</option>
            <option value="sold">مباعة</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button className="rounded bg-blue-600 text-white px-3 py-1" onClick={save}>حفظ</button>
        <button className="rounded border px-3 py-1" onClick={onDone}>إلغاء</button>
      </div>
    </div>
  );
}

