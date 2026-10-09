"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Leaf, LoaderCircle, LogOut, Pencil, Plus, Save, Settings2, ShieldCheck, Sprout, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Catalog, FarmSettings, Locale, Vegetable } from "@/lib/types";

type Session = { id: string; email: string };
type Draft = Omit<Vegetable, "id" | "updatedAt">;

const emptyDraft: Draft = { nameTh: "", nameEn: "", descriptionTh: "", descriptionEn: "", priceBaht: 45, stockBags: 0, displayOrder: 1 };

const copy = {
  th: {
    eyebrow: "พื้นที่ผู้ดูแล", title: "สวัสดีทีมสวน", subtitle: "จัดผัก ราคา และจำนวนคงเหลือ แล้วหน้าร้านจะเปลี่ยนทันที", signIn: "เข้าสู่หลังบ้าน", email: "อีเมลผู้ดูแล", password: "รหัสผ่าน", enter: "เข้าสู่ระบบ", reset: "ส่งลิงก์ตั้งรหัสใหม่", resetSent: "ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว", setup: "ยังไม่ได้เชื่อมระบบหลังบ้าน", setupDesc: "เพิ่มค่า Supabase และอีเมลผู้ดูแลในตัวแปรลับของเว็บไซต์ก่อนเริ่มใช้งาน", inventory: "รายการผัก", inventoryDesc: "สินค้าที่เหลือ 0 ถุงจะไม่แสดงให้ลูกค้าเห็น", add: "เพิ่มผัก", starter: "เพิ่มรายการตัวอย่าง", settings: "ตั้งค่าฟาร์ม", save: "บันทึก", cancel: "ยกเลิก", edit: "แก้ไข", delete: "ลบ", deleteTitle: "ลบรายการผักนี้?", deleteDesc: "รายการจะหายจากหลังบ้านและหน้าร้านทันที", confirmDelete: "ลบรายการ", fieldNameTh: "ชื่อผัก (ไทย)", fieldNameEn: "ชื่อผัก (English)", fieldDescTh: "รายละเอียด (ไทย)", fieldDescEn: "Description (English)", price: "ราคา (บาท/ถุง)", stock: "จำนวนคงเหลือ (ถุง)", order: "ลำดับแสดงผล", farmTh: "ชื่อฟาร์ม (ไทย)", farmEn: "Farm name (English)", line: "LINE Official Account ID", lineHelp: "เช่น @kendofarm — ใช้สำหรับปุ่มทัก LINE ของลูกค้า", signedIn: "เข้าสู่ระบบแล้ว", logout: "ออกจากระบบ", live: "แสดงหน้าร้าน", hidden: "ซ่อนจากหน้าร้าน", error: "เกิดข้อผิดพลาด", demo: "ยังไม่มีข้อมูลในฐานข้อมูล", demoDesc: "เพิ่มตัวอย่าง 4 รายการเพื่อเริ่มแก้ไขได้ทันที", formTitle: "แก้ไขรายการผัก", newTitle: "เพิ่มผักใหม่", saveVegetable: "บันทึกรายการผัก", created: "บันทึกแล้ว", bags: "ถุง",
  },
  en: {
    eyebrow: "FARM TEAM", title: "Hello, garden team", subtitle: "Update vegetables, prices, and stock. The shop changes right away.", signIn: "Sign in to the dashboard", email: "Admin email", password: "Password", enter: "Sign in", reset: "Send password reset link", resetSent: "Password reset link sent", setup: "The dashboard is not connected yet", setupDesc: "Add the Supabase values and approved farm emails to this site's secret environment settings.", inventory: "Vegetable inventory", inventoryDesc: "Items with zero bags are hidden from customers.", add: "Add vegetable", starter: "Add starter vegetables", settings: "Farm settings", save: "Save changes", cancel: "Cancel", edit: "Edit", delete: "Delete", deleteTitle: "Delete this vegetable?", deleteDesc: "It will disappear from both the dashboard and the public shop right away.", confirmDelete: "Delete vegetable", fieldNameTh: "Vegetable name (Thai)", fieldNameEn: "Vegetable name (English)", fieldDescTh: "Description (Thai)", fieldDescEn: "Description (English)", price: "Price (THB / bag)", stock: "Stock remaining (bags)", order: "Display order", farmTh: "Farm name (Thai)", farmEn: "Farm name (English)", line: "LINE Official Account ID", lineHelp: "For example: @kendofarm — used by customer LINE buttons", signedIn: "Signed in", logout: "Sign out", live: "Visible in shop", hidden: "Hidden from shop", error: "Something went wrong", demo: "Your D1 database is empty", demoDesc: "Add four editable starter vegetables to begin.", formTitle: "Edit vegetable", newTitle: "Add a vegetable", saveVegetable: "Save vegetable", created: "Saved", bags: "bags",
  },
} as const;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Request failed.");
  return body as T;
}

function toDraft(vegetable: Vegetable): Draft {
  const { id: _id, updatedAt: _updatedAt, ...draft } = vegetable;
  return draft;
}

export function AdminDashboard() {
  const [locale, setLocale] = useState<Locale>("th");
  const [session, setSession] = useState<Session | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [status, setStatus] = useState<"loading" | "signed-out" | "setup">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Omit<FarmSettings, "updatedAt"> | null>(null);
  const [busy, setBusy] = useState(false);
  const text = copy[locale];

  async function loadDashboard() {
    const data = await api<Catalog>("/api/admin/catalog");
    setCatalog(data);
    setSettings({ farmNameTh: data.settings.farmNameTh, farmNameEn: data.settings.farmNameEn, lineOfficialId: data.settings.lineOfficialId });
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("kendo-locale");
    if (saved === "th" || saved === "en") setLocale(saved);
    api<{ user: Session }>("/api/admin/session")
      .then(async ({ user }) => { setSession(user); await loadDashboard(); setStatus("signed-out"); })
      .catch((reason: Error) => { setStatus(reason.message.includes("configured") ? "setup" : "signed-out"); });
  }, []);

  function switchLocale(next: Locale) {
    setLocale(next);
    window.localStorage.setItem("kendo-locale", next);
  }

  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api("/api/admin/session", { method: "POST", body: JSON.stringify({ email, password }) });
      const nextSession = await api<{ user: Session }>("/api/admin/session");
      setSession(nextSession.user); await loadDashboard(); setPassword("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : text.error); }
    finally { setBusy(false); }
  }

  async function resetPassword() {
    setBusy(true); setError(""); setNotice("");
    try { await api("/api/admin/password-reset", { method: "POST", body: JSON.stringify({ email }) }); setNotice(text.resetSent); }
    catch (reason) { setError(reason instanceof Error ? reason.message : text.error); }
    finally { setBusy(false); }
  }

  async function saveVegetable(event: FormEvent) {
    event.preventDefault(); if (!draft) return; setBusy(true); setError("");
    try {
      const path = editingId ? `/api/admin/vegetables/${editingId}` : "/api/admin/vegetables";
      await api(path, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(draft) });
      await loadDashboard(); setDraft(null); setEditingId(null); setNotice(text.created);
    } catch (reason) { setError(reason instanceof Error ? reason.message : text.error); }
    finally { setBusy(false); }
  }

  async function removeVegetable(id: string) {
    setBusy(true); setError("");
    try { await api(`/api/admin/vegetables/${id}`, { method: "DELETE" }); await loadDashboard(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : text.error); }
    finally { setBusy(false); }
  }

  async function seedCatalog() {
    setBusy(true); setError("");
    try { const data = await api<Catalog>("/api/admin/starter-catalog", { method: "POST" }); setCatalog(data); setSettings({ farmNameTh: data.settings.farmNameTh, farmNameEn: data.settings.farmNameEn, lineOfficialId: data.settings.lineOfficialId }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : text.error); }
    finally { setBusy(false); }
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault(); if (!settings) return; setBusy(true); setError("");
    try { const saved = await api<FarmSettings>("/api/admin/settings", { method: "PATCH", body: JSON.stringify(settings) }); setSettings({ farmNameTh: saved.farmNameTh, farmNameEn: saved.farmNameEn, lineOfficialId: saved.lineOfficialId }); await loadDashboard(); setNotice(text.created); }
    catch (reason) { setError(reason instanceof Error ? reason.message : text.error); }
    finally { setBusy(false); }
  }

  async function logout() {
    await api("/api/admin/session", { method: "DELETE" }); setSession(null); setCatalog(null); setStatus("signed-out");
  }

  const field = (key: keyof Draft, label: string, kind: "input" | "textarea" = "input", type = "text") => {
    const props = { value: String(draft?.[key] ?? ""), onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft((current) => current ? { ...current, [key]: type === "number" ? Number(event.target.value) : event.target.value } : current), required: true };
    return <label className="block text-sm font-bold text-[#315546]"><span className="mb-2 block">{label}</span>{kind === "textarea" ? <Textarea {...props} /> : <Input {...props} type={type} min={type === "number" ? 0 : undefined} />}</label>;
  };

  return <main className="min-h-screen bg-[#f6f2e8] px-4 py-5 text-[#173529] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-[#174e3a] px-5 py-4 text-white shadow-lg sm:px-7">
        <a href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dcf7ae] text-[#174e3a]"><Leaf className="h-5 w-5 fill-current" /></span><span><strong className="block tracking-[.15em]">KENDO FARM</strong><span className="text-xs text-white/70">{text.eyebrow}</span></span></a>
        <div className="flex items-center gap-3"><div className="rounded-xl bg-white/10 p-1"><button onClick={() => switchLocale("th")} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${locale === "th" ? "bg-[#efffcb] text-[#173529]" : "text-white/75"}`}>ไทย</button><button onClick={() => switchLocale("en")} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${locale === "en" ? "bg-[#efffcb] text-[#173529]" : "text-white/75"}`}>EN</button></div>{session && <Button variant="ghost" onClick={logout} className="text-white hover:bg-white/10 hover:text-white"><LogOut /> {text.logout}</Button>}</div>
      </header>

      {status === "loading" && <div className="grid min-h-80 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#4e8142]" /></div>}
      {status === "setup" && <section className="mx-auto max-w-xl rounded-[1.5rem] border border-[#ecd5a4] bg-[#fff9e9] p-8 text-center"><TriangleAlert className="mx-auto h-9 w-9 text-[#a66b16]" /><h1 className="mt-4 text-2xl font-black">{text.setup}</h1><p className="mt-3 leading-6 text-[#75613d]">{text.setupDesc}</p></section>}
      {status === "signed-out" && !session && <section className="mx-auto max-w-md rounded-[1.5rem] border border-[#dce5c4] bg-[#fffef8] p-6 shadow-[0_16px_40px_rgba(27,62,46,.1)] sm:p-8"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dcf7ae] text-[#174e3a]"><ShieldCheck /></div><h1 className="mt-5 text-3xl font-black tracking-[-.04em]">{text.signIn}</h1><p className="mt-2 text-sm leading-6 text-[#637568]">{text.subtitle}</p><form onSubmit={signIn} className="mt-6 space-y-4"><label className="block text-sm font-bold"><span className="mb-2 block">{text.email}</span><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label className="block text-sm font-bold"><span className="mb-2 block">{text.password}</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}{notice && <p className="rounded-xl bg-[#eff8dc] p-3 text-sm font-medium text-[#42613b]">{notice}</p>}<Button disabled={busy} className="h-11 w-full rounded-xl bg-[#174e3a] font-bold">{busy && <LoaderCircle className="animate-spin" />}{text.enter}</Button></form><button type="button" disabled={!email || busy} onClick={resetPassword} className="mt-4 w-full text-sm font-bold text-[#4d7d3c] hover:underline">{text.reset}</button></section>}

      {session && catalog && <div className="space-y-7"><section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black tracking-[.18em] text-[#5e8b46]">{text.signedIn}: {session.email}</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{text.title}</h1><p className="mt-2 text-[#637568]">{text.subtitle}</p></div><Button onClick={() => { setDraft({ ...emptyDraft, displayOrder: catalog.vegetables.length + 1 }); setEditingId(null); setNotice(""); }} className="h-11 rounded-xl bg-[#174e3a] font-bold"><Plus /> {text.add}</Button></section>
        {(error || notice) && <p className={`rounded-xl px-4 py-3 text-sm font-medium ${error ? "bg-red-50 text-red-700" : "bg-[#eff8dc] text-[#42613b]"}`}>{error || notice}</p>}
        <section className="grid gap-7 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-[1.5rem] border border-[#dce5c4] bg-[#fffef8] p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.15em] text-[#5e8b46]">{text.inventory.toUpperCase()}</p><h2 className="mt-2 text-2xl font-black">{text.inventory}</h2><p className="mt-1 text-sm text-[#637568]">{text.inventoryDesc}</p></div><Sprout className="h-8 w-8 text-[#64964c]" /></div>{catalog.vegetables.length === 0 ? <div className="mt-7 rounded-2xl border border-dashed border-[#bbd482] bg-[#f5fae8] p-6"><h3 className="font-black">{text.demo}</h3><p className="mt-1 text-sm text-[#637568]">{text.demoDesc}</p><Button onClick={seedCatalog} disabled={busy} className="mt-4 rounded-xl bg-[#174e3a]">{text.starter}</Button></div> : <div className="mt-6 space-y-3">{catalog.vegetables.map((vegetable) => <div key={vegetable.id} className="flex flex-col gap-3 rounded-2xl border border-[#e3ead0] p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{locale === "th" ? vegetable.nameTh : vegetable.nameEn}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${vegetable.stockBags > 0 ? "bg-[#eaf7d2] text-[#46753d]" : "bg-[#f1e7e1] text-[#9b4a3d]"}`}>{vegetable.stockBags > 0 ? text.live : text.hidden}</span></div><p className="mt-1 text-sm text-[#637568]">฿{vegetable.priceBaht.toLocaleString()} · {vegetable.stockBags} {text.bags ?? "bags"}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setDraft(toDraft(vegetable)); setEditingId(vegetable.id); setNotice(""); }}><Pencil /> {text.edit}</Button><AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"><Trash2 /> {text.delete}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{text.deleteTitle}</AlertDialogTitle><AlertDialogDescription>{text.deleteDesc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{text.cancel}</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => removeVegetable(vegetable.id)}>{text.confirmDelete}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>)}</div>}</div>
          <aside className="rounded-[1.5rem] border border-[#dce5c4] bg-[#fffef8] p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dcf7ae] text-[#174e3a]"><Settings2 className="h-5 w-5" /></span><h2 className="text-xl font-black">{text.settings}</h2></div>{settings && <form onSubmit={saveSettings} className="mt-6 space-y-4"><label className="block text-sm font-bold"><span className="mb-2 block">{text.farmTh}</span><Input value={settings.farmNameTh} onChange={(event) => setSettings({ ...settings, farmNameTh: event.target.value })} required /></label><label className="block text-sm font-bold"><span className="mb-2 block">{text.farmEn}</span><Input value={settings.farmNameEn} onChange={(event) => setSettings({ ...settings, farmNameEn: event.target.value })} required /></label><label className="block text-sm font-bold"><span className="mb-2 block">{text.line}</span><Input placeholder="@kendofarm" value={settings.lineOfficialId} onChange={(event) => setSettings({ ...settings, lineOfficialId: event.target.value })} /></label><p className="text-xs leading-5 text-[#637568]">{text.lineHelp}</p><Button disabled={busy} className="w-full rounded-xl bg-[#174e3a]"><Save /> {text.save}</Button></form>}</aside>
        </section>
        {draft && <section className="rounded-[1.5rem] border border-[#dce5c4] bg-[#fffef8] p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black tracking-[.15em] text-[#5e8b46]">{editingId ? text.formTitle.toUpperCase() : text.newTitle.toUpperCase()}</p><h2 className="mt-2 text-2xl font-black">{editingId ? text.formTitle : text.newTitle}</h2></div><Button variant="ghost" onClick={() => { setDraft(null); setEditingId(null); }}>{text.cancel}</Button></div><form onSubmit={saveVegetable} className="mt-6 grid gap-5 md:grid-cols-2">{field("nameTh", text.fieldNameTh)}{field("nameEn", text.fieldNameEn)}{field("descriptionTh", text.fieldDescTh, "textarea")}{field("descriptionEn", text.fieldDescEn, "textarea")}{field("priceBaht", text.price, "input", "number")}{field("stockBags", text.stock, "input", "number")}{field("displayOrder", text.order, "input", "number")}<div className="flex items-end"><Button disabled={busy} className="h-10 w-full rounded-xl bg-[#174e3a] font-bold"><Save /> {text.saveVegetable}</Button></div></form></section>}
      </div>}
    </div>
  </main>;
}
