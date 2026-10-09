"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, CircleDollarSign, Languages, Leaf, MapPin, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Catalog, Locale, Vegetable } from "@/lib/types";

type StorefrontProps = { catalog: Catalog; isDemo: boolean };

type ModelContext = {
  registerTool: (tool: {
    name: string;
    title: string;
    description: string;
    inputSchema: object;
    annotations: { readOnlyHint: true; untrustedContentHint: false };
    execute: () => unknown;
  }, options: { signal: AbortSignal }) => void | Promise<void>;
};

const copy = {
  th: {
    mission: "ภารกิจวันนี้", heroTitle: "ผักสดที่พร้อม\nออกผจญภัยกับคุณ", heroDescription: "ผักไฮโดรโปนิกส์เก็บสดจากสวน KENDO FARM ในเช้าวันนี้ เลือกคู่หูสีเขียวของคุณ แล้วทักเราใน LINE ได้เลย", explore: "สำรวจผักวันนี้", trustOne: "ปลูกแบบไฮโดรโปนิกส์", trustTwo: "เก็บสดทุกเช้า", trustThree: "ราคาโปร่งใส", storyEyebrow: "เรื่องราวจากสวน", storyTitle: "ปลูกจริง เก็บจริง ส่งต่อความสด", storyDescription: "ภาพจากโรงเรือน KENDO FARM ในทุกช่วงของการดูแลผัก", today: "เสบียงวันนี้", todayTitle: "เลือกคู่หูสีเขียวของคุณ", todayDescription: "ทุกถุงคัดสดจากสวนและพร้อมให้คุณพากลับบ้าน", updated: "อัปเดตล่าสุด", bagsLeft: "เหลือ", bags: "ถุง", bahtPerBag: "บาท / ถุง", ready: "พร้อมจัดส่ง", chatPersonal: "เปิดโปรไฟล์ LINE", chatOfficial: "ทัก LINE เรื่องผักนี้", lineMissing: "กำลังตั้งค่า LINE", emptyTitle: "สวนกำลังเตรียมรอบใหม่", emptyDescription: "วันนี้ยังไม่มีผักพร้อมขาย ลองกลับมาใหม่เร็ว ๆ นี้นะ", demo: "นี่คือรายการตัวอย่าง — เข้าหลังบ้านเพื่อใส่ผักจริง", footer: "ปลูกด้วยความใส่ใจ ส่งต่อความสดถึงคุณ", farm: "สวนผักไฮโดรโปนิกส์", contactMessage: (name: string) => `สวัสดีค่ะ/ครับ สนใจผัก ${name} ของ KENDO FARM ค่ะ/ครับ`,
  },
  en: {
    mission: "TODAY'S QUEST", heroTitle: "Fresh greens, ready\nfor your next adventure.", heroDescription: "Hydroponic vegetables harvested at KENDO FARM this morning. Pick your green companion, then say hello on LINE.", explore: "Explore today's harvest", trustOne: "Hydroponically grown", trustTwo: "Harvested each morning", trustThree: "Clear, fair prices", storyEyebrow: "FROM OUR FARM", storyTitle: "Grown here. Harvested here. Shared fresh.", storyDescription: "Real moments from the KENDO FARM greenhouse.", today: "TODAY'S SUPPLY", todayTitle: "Choose your green companion", todayDescription: "Every bag is freshly picked and ready to travel home with you.", updated: "Last updated", bagsLeft: "Only", bags: "bags left", bahtPerBag: "THB / bag", ready: "READY TO SHIP", chatPersonal: "Open LINE profile", chatOfficial: "Ask about this on LINE", lineMissing: "LINE is being set up", emptyTitle: "The garden is preparing a new round", emptyDescription: "There are no vegetables ready today. Please check back soon.", demo: "Sample inventory — visit the dashboard to add your live vegetables.", footer: "Grown with care, shared fresh with you.", farm: "HYDROPONIC GARDEN", contactMessage: (name: string) => `Hello! I'm interested in ${name} from KENDO FARM.`,
  },
} as const;

const heroPhoto = { src: "/farm/greenhouse-harvest.png", alt: "Wide view of the KENDO FARM hydroponic greenhouse" } as const;

function textFor(vegetable: Vegetable, locale: Locale) {
  return locale === "th" ? { name: vegetable.nameTh, description: vegetable.descriptionTh } : { name: vegetable.nameEn, description: vegetable.descriptionEn };
}

function lineUrl(lineId: string, accountType: "personal" | "official", message: string) {
  const normalizedId = lineId.trim();
  if (!normalizedId) return null;
  if (accountType === "personal") {
    return `https://line.me/R/ti/p/~${encodeURIComponent(normalizedId.replace(/^@/, ""))}`;
  }
  return `https://line.me/R/oaMessage/${encodeURIComponent(normalizedId)}/?${encodeURIComponent(message)}`;
}

function formatUpdated(updatedAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(updatedAt));
}

function formatPrice(price: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(price);
}

export function Storefront({ catalog, isDemo }: StorefrontProps) {
  const [locale, setLocale] = useState<Locale>("th");
  const text = copy[locale];
  const latest = useMemo(() => catalog.vegetables.reduce((value, item) => item.updatedAt > value ? item.updatedAt : value, catalog.settings.updatedAt), [catalog]);

  useEffect(() => {
    const saved = window.localStorage.getItem("kendo-locale");
    if (saved === "th" || saved === "en") setLocale(saved);
  }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context) return;
    const controller = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "get_todays_hydroponic_harvest",
      title: "Get today's KENDO FARM harvest",
      description: "Read the vegetable varieties currently shown as available in the KENDO FARM storefront.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => ({
        updatedAt: catalog.settings.updatedAt,
        vegetables: catalog.vegetables.map((item) => ({ nameTh: item.nameTh, nameEn: item.nameEn, priceBaht: item.priceBaht, stockBags: item.stockBags })),
      }),
    }, { signal: controller.signal })).catch(() => undefined);
    return () => controller.abort();
  }, [catalog]);

  function changeLocale(next: Locale) {
    setLocale(next);
    window.localStorage.setItem("kendo-locale", next);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f2e8] text-[#16352a]">
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-10 lg:px-14">
        <a className="flex items-center gap-3 text-white" href="#top" aria-label="KENDO FARM home">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/30 bg-white/15 shadow-lg backdrop-blur"><Leaf aria-hidden="true" className="h-5 w-5 fill-[#d9f99d] text-[#d9f99d]" /></span>
          <span><strong className="block text-sm tracking-[0.2em]">KENDO FARM</strong><span className="block text-[10px] font-medium tracking-[0.15em] text-white/70">{text.farm}</span></span>
        </a>
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-[#0d2f25]/45 p-1.5 shadow-lg backdrop-blur">
          <Languages aria-hidden="true" className="ml-2 h-4 w-4 text-[#d9f99d]" />
          {(["th", "en"] as const).map((value) => <button key={value} type="button" onClick={() => changeLocale(value)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${locale === value ? "bg-[#efffcb] text-[#16352a]" : "text-white/80 hover:text-white"}`}>{value === "th" ? "ไทย" : "EN"}</button>)}
        </div>
      </header>

      <section id="top" className="relative isolate min-h-[760px] overflow-hidden bg-[#133c2e] sm:min-h-[720px]">
        <img src={heroPhoto.src} alt={heroPhoto.alt} className="absolute inset-0 h-full w-full object-cover object-center saturate-[1.12]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,35,26,.96)_0%,rgba(4,35,26,.82)_30%,rgba(4,35,26,.28)_68%,rgba(4,35,26,.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(246,242,232,.96)_0%,rgba(246,242,232,0)_18%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f6f2e8] to-transparent" />
        <div className="relative mx-auto flex min-h-[760px] w-full max-w-[1440px] items-center px-5 pb-16 pt-32 sm:min-h-[720px] sm:px-10 lg:px-14">
          <div className="max-w-xl text-white">
            <p className="mb-5 flex w-fit items-center gap-2 rounded-full border border-[#e9ffac]/30 bg-[#152f24]/70 px-4 py-2 text-xs font-extrabold tracking-[0.16em] text-[#e9ffac] backdrop-blur"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> {text.mission}</p>
            <h1 className="whitespace-pre-line font-display text-5xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl lg:text-7xl">{text.heroTitle}</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/82 sm:text-lg">{text.heroDescription}</p>
            <a href="#harvest" className="mt-8 inline-flex"><Button className="h-13 rounded-2xl bg-[#ecffad] px-6 text-sm font-extrabold text-[#173529] shadow-[0_12px_30px_rgba(177,220,51,.25)] hover:bg-white">{text.explore} <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button></a>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 grid w-[calc(100%-2.5rem)] max-w-5xl grid-cols-1 rounded-[1.75rem] border border-[#d3ddaf] bg-[#fcfdf3] p-3 shadow-[0_18px_50px_rgba(27,62,46,.12)] sm:grid-cols-3 sm:p-4">
        {[[ShieldCheck, text.trustOne], [Sparkles, text.trustTwo], [CircleDollarSign, text.trustThree]].map(([Icon, label], index) => { const FeatureIcon = Icon as typeof ShieldCheck; return <div key={label as string} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${index < 2 ? "sm:border-r sm:border-[#e6ebd4]" : ""}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dcf7ae] text-[#19503b]"><FeatureIcon aria-hidden="true" className="h-5 w-5" /></span><span className="text-sm font-bold text-[#214536]">{label as string}</span></div>; })}
      </section>

      <section id="harvest" className="mx-auto max-w-[1440px] px-5 pb-20 pt-20 sm:px-10 lg:px-14">
        <div className="flex flex-col justify-between gap-6 border-b border-[#d9dec5] pb-8 sm:flex-row sm:items-end"><div><p className="text-xs font-black tracking-[0.2em] text-[#598344]">{text.today}</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-[#173529] sm:text-4xl">{text.todayTitle}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#5c7062] sm:text-base">{text.todayDescription}</p></div><p className="flex items-center gap-2 text-sm font-semibold text-[#5c7062]"><MapPin aria-hidden="true" className="h-4 w-4 text-[#57843f]" /> {text.updated}: {formatUpdated(latest, locale)}</p></div>
        {isDemo && <p className="mt-6 rounded-2xl border border-dashed border-[#bbd482] bg-[#f2f8df] px-4 py-3 text-sm font-medium text-[#42613b]">{text.demo}</p>}
        {catalog.vegetables.length ? <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {catalog.vegetables.map((vegetable, index) => {
            const item = textFor(vegetable, locale); const chatUrl = lineUrl(catalog.settings.lineOfficialId, catalog.settings.lineAccountType, text.contactMessage(item.name)); const chatLabel = catalog.settings.lineAccountType === "official" ? text.chatOfficial : text.chatPersonal; const accent = ["#d9f99d", "#fecdd3", "#fde68a", "#bbf7d0"][index % 4];
            return <article key={vegetable.id} className="group relative overflow-hidden rounded-[1.5rem] border border-[#dce5c4] bg-[#fffef8] p-5 shadow-[0_8px_24px_rgba(27,62,46,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(27,62,46,.14)]"><div className="absolute right-0 top-0 h-28 w-28 -translate-y-8 translate-x-8 rounded-full opacity-65" style={{ backgroundColor: accent }} /><div className="relative -mx-5 -mt-5 mb-5 h-44 overflow-hidden rounded-t-[1.5rem] bg-[#e8f0d8]">{vegetable.imageUrl ? <img src={vegetable.imageUrl} alt={`${item.name} at KENDO FARM`} loading="lazy" className="h-full w-full object-cover saturate-[1.08] transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-5xl" aria-hidden="true">{index === 0 ? "🥬" : index === 1 ? "🥗" : index === 2 ? "🌿" : "🍃"}</div>}<span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#174e3a]/90 px-3 py-1.5 text-[10px] font-black tracking-[.12em] text-[#ecffad] shadow-lg"><Check aria-hidden="true" className="h-3 w-3" /> {text.ready}</span></div><div className="relative"><h3 className="text-2xl font-black tracking-[-.035em] text-[#1c392d]">{item.name}</h3><p className="mt-2 min-h-12 text-sm leading-5 text-[#637568]">{item.description}</p></div><div className="relative mt-5 flex items-end justify-between border-t border-[#e6ead9] pt-4"><div><p className="text-2xl font-black tracking-[-.04em] text-[#174e3a]">{formatPrice(vegetable.priceBaht, locale)}</p><p className="text-xs font-semibold text-[#698072]">{text.bahtPerBag}</p></div><p className="rounded-xl bg-[#f0f7d8] px-2.5 py-2 text-xs font-extrabold text-[#42613b]">{text.bagsLeft} {vegetable.stockBags} {text.bags}</p></div>{chatUrl ? <a href={chatUrl} target="_blank" rel="noreferrer" className="relative mt-5 flex w-full"><Button className="h-11 w-full rounded-xl bg-[#1aab59] text-sm font-extrabold text-white hover:bg-[#148e49]"><MessageCircle aria-hidden="true" className="mr-2 h-4 w-4" />{chatLabel} <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button></a> : <Button disabled className="relative mt-5 h-11 w-full rounded-xl bg-[#d7dfcf] text-sm font-bold text-[#6c7b6c]"><MessageCircle aria-hidden="true" className="mr-2 h-4 w-4" />{text.lineMissing}</Button>}</article>;
          })}
        </div> : <div className="mt-10 rounded-[1.75rem] border border-dashed border-[#bdcfa8] bg-[#fbfdf2] px-6 py-16 text-center"><PackageCheck aria-hidden="true" className="mx-auto h-10 w-10 text-[#608a4a]" /><h3 className="mt-4 text-xl font-black text-[#244333]">{text.emptyTitle}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647467]">{text.emptyDescription}</p></div>}
      </section>

      <footer className="border-t border-[#d9dec5] bg-[#eaf0d8] px-5 py-8 sm:px-10 lg:px-14"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 text-sm text-[#54705c] sm:flex-row sm:items-center"><p className="font-bold tracking-[.1em] text-[#204233]">{locale === "th" ? catalog.settings.farmNameTh : catalog.settings.farmNameEn}</p><p>{text.footer}</p><a href="/admin" className="inline-flex items-center gap-1 font-semibold text-[#477738] hover:text-[#204233]">{locale === "th" ? "สำหรับผู้ดูแล" : "For the farm team"} <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 -rotate-90" /></a></div></footer>
    </main>
  );
}
