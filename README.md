# 🥬 KENDO FARM

เว็บไซต์หน้าร้านและหลังบ้านสำหรับฟาร์มผักไฮโดรโปนิกส์ของครอบครัว ให้ลูกค้าดูผักที่พร้อมจำหน่ายและติดต่อผ่าน LINE ได้สะดวก พร้อมพื้นที่สำหรับจัดการสินค้าและข้อมูลฟาร์ม

[🌿 ดูหน้าร้าน](https://kendo-farm.yamrollpoon.chatgpt.site) · [🔐 เข้าสู่หลังบ้าน](https://kendo-farm.yamrollpoon.chatgpt.site/admin)

---

## สิ่งที่ทำได้

### 🌱 หน้าร้าน

- เลือกภาษาไทยหรือ English และจำภาษาที่เลือกไว้บนอุปกรณ์
- แสดงผักที่มีสต็อกมากกว่า 0 ถุง พร้อมรูปจริง ราคา และจำนวนคงเหลือ
- ติดต่อผ่าน LINE ส่วนตัวเพื่อเปิดโปรไฟล์ หรือ LINE Official Account เพื่อเติมข้อความผักในแชต
- ชมภาพบรรยากาศการปลูกจริงจากโรงเรือน

### 🧺 หลังบ้าน

เข้า `/admin` ด้วยบัญชี Supabase Auth ที่มีอีเมลอยู่ใน `ADMIN_EMAILS` เพื่อ:

- เพิ่ม แก้ไข และลบผัก รวมถึงปรับราคา สต็อก และลำดับการแสดงผล
- อัปโหลดรูปผักจากเครื่อง โดยระบบย่อรูปก่อนบันทึกเพื่อควบคุมขนาดข้อมูล
- เลือกประเภทบัญชี LINE และเปลี่ยน LINE ID ของพ่อหรือแม่
- เปลี่ยนชื่อฟาร์มทั้งภาษาไทยและ English

## 🚀 เริ่มพัฒนาในเครื่อง

ต้องมี **Node.js 22.13.0 ขึ้นไป** และ npm จากนั้นเปิด terminal ที่โฟลเดอร์หลักของโปรเจกต์:

```bash
cd site
npm install
npm run dev
```

สำหรับการสร้าง production build ใช้ `npm run build` หากต้องการทดลองรัน build ในเครื่อง ให้รัน `npm run start` หลัง build สำเร็จ

## 🔑 ตั้งค่า Supabase และ LINE

ตั้งค่าตัวแปรต่อไปนี้ผ่าน Runtime Environment ของ Site โดยแทนค่าตัวอย่างด้วยค่าของโปรเจกต์:

```text
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
ADMIN_EMAILS=father@example.com,mother@example.com
LINE_DEFAULT_ID=your-line-id
```

เปิด Email provider ใน Supabase และสร้างบัญชีผู้ดูแลที่ **Authentication > Users** ก่อนเข้า `/admin` โดยอีเมลต้องตรงกับรายการใน `ADMIN_EMAILS` ซึ่งคั่นแต่ละอีเมลด้วยเครื่องหมายจุลภาค

> อย่า commit ค่า Supabase จริง, session cookie หรือรหัสผ่านลง Git

## 🗂️ โครงสร้างโปรเจกต์

```text
KENDO-Farm/
├── README.md             คู่มือหลักของโปรเจกต์
├── .github/workflows/    GitHub Actions
└── site/
    ├── app/              ตัวเชื่อม route ของ Vinext
    ├── frontend/         หน้าเว็บ, components, hooks, styles และ API client
    ├── backend/          API, authentication, D1 และ connector ฝั่งเซิร์ฟเวอร์
    ├── shared/           ชนิดข้อมูล, validation และข้อมูลตัวอย่างที่ใช้ร่วมกัน
    ├── drizzle/          Database migrations
    ├── public/farm/      รูปตกแต่งของฟาร์ม
    ├── tests/            Unit และ integration tests
    └── cypress/          End-to-end tests
```

Frontend และ backend แยกตามหน้าที่ภายในโปรเจกต์ แต่เผยแพร่ร่วมกันเป็น Vinext/Cloudflare Worker เดียวกัน ส่วน `shared/` ใช้สำหรับโค้ดที่ปลอดภัยทั้งใน browser และ Worker จึงไม่ควรใส่ Cloudflare bindings, secrets หรือโมดูลเฉพาะเซิร์ฟเวอร์ไว้ที่นี่ ดูรายละเอียดเพิ่มเติมได้ที่ [site/ARCHITECTURE.md](site/ARCHITECTURE.md)

Cloudflare D1 เก็บข้อมูลผัก ราคา สต็อก การตั้งค่า และรูปที่อัปโหลดแบบย่อ โดย migrations อยู่ใน `site/drizzle/` และถูกนำไปใช้ตอนเผยแพร่ ผักที่มี `stock_bags = 0` จะไม่แสดงในหน้าร้าน

## 🧪 ตรวจสอบและทดสอบ

รันคำสั่งต่อไปนี้จากโฟลเดอร์ `site/`:

| คำสั่ง | สิ่งที่ตรวจสอบ |
| --- | --- |
| `npm run lint` | รูปแบบและข้อผิดพลาดของโค้ดด้วย ESLint |
| `npm run check:architecture` | ขอบเขตการแบ่งโค้ดในโปรเจกต์ |
| `npm run test:unit` | Unit และ frontend tests ด้วย Vitest, React Testing Library และ MSW |
| `npm run test:integration` | Backend integration ใน Worker runtime รวมถึง D1, repository, catalog API และ auth |
| `npm run test:coverage` | ชุดทดสอบพร้อมรายงาน coverage |
| `npm run build` | สร้าง production build |

สำหรับ **Cypress E2E** ให้ build และเปิดเซิร์ฟเวอร์ใน terminal หนึ่งก่อน:

```bash
cd site
npm run build
npm run start
```

จากนั้นเปิดอีก terminal แล้วรัน:

```bash
cd site
npm run test:e2e
```

Cypress ใช้ `http://127.0.0.1:8787` เป็นค่าเริ่มต้น หากเซิร์ฟเวอร์อยู่ที่ URL อื่นให้ตั้ง `CYPRESS_BASE_URL` ก่อนรันทดสอบ ชุดทดสอบครอบคลุมทั้งหน้าร้านและหลังบ้าน เช่น การเปลี่ยนภาษา การเปิด LINE การเข้าสู่ระบบ และการจัดการผัก

GitHub Actions รัน lint, unit tests, coverage, integration tests, build และ Cypress เมื่อ push หรือเปิด Pull Request ไปยัง `develop` หรือ `main`
