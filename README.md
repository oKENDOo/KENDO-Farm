# KENDO FARM

เว็บไซต์หน้าร้านและหลังบ้านสำหรับฟาร์มผักไฮโดรโปนิกส์ของครอบครัว

## เปิดดูเว็บไซต์

- หน้าร้าน: https://kendo-farm.yamrollpoon.chatgpt.site
- หลังบ้าน: https://kendo-farm.yamrollpoon.chatgpt.site/admin


## หน้าร้าน

- ภาษาไทยและ English พร้อมจำภาษาที่เลือกไว้บนอุปกรณ์
- แสดงผักที่มีสต็อกมากกว่า 0 ถุง พร้อมราคาและจำนวนคงเหลือ
- การ์ดผักมีรูปภาพจริงจากฟาร์ม
- ปุ่ม LINE พร้อมไอคอน
- รองรับ LINE ส่วนตัวสำหรับเปิดโปรไฟล์ และ LINE Official Account สำหรับเติมข้อความผักในแชต
- แกลเลอรีภาพบรรยากาศการปลูกจริงจากโรงเรือน

## หลังบ้าน

เข้า `/admin` ด้วยบัญชี Supabase Auth ที่อยู่ใน `ADMIN_EMAILS` แล้วสามารถ:

- เพิ่ม แก้ไข และลบรายการผัก
- ปรับราคา จำนวนคงเหลือ และลำดับแสดงผล
- อัปโหลดรูปผักจากเครื่อง รูปจะถูกย่อก่อนบันทึกเพื่อคุมขนาดข้อมูล
- เลือกประเภท LINE และเปลี่ยน LINE ID ของพ่อหรือแม่ได้เอง
- เปลี่ยนชื่อฟาร์มทั้งภาษาไทยและ English

## การตั้งค่า Supabase

ตั้งค่าผ่าน Runtime Environment ของ Site ห้ามใส่ค่าจริงลง Git:

```text
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
ADMIN_EMAILS=father@example.com,mother@example.com
LINE_DEFAULT_ID=your-line-id
```

ใน Supabase ให้เปิด Email provider และสร้างผู้ดูแลที่ `Authentication > Users` ก่อนเข้า `/admin`

## โครงสร้างข้อมูลและรูปภาพ

- Cloudflare D1 เก็บผัก ราคา สต็อก การตั้งค่า และรูปที่อัปโหลดแบบย่อ
- รูปตกแต่งของฟาร์มอยู่ใน `site/public/farm/`
- Migration อยู่ใน `site/drizzle/` และถูกนำไปใช้ตอนเผยแพร่
- ข้อมูลผักที่มี `stock_bags = 0` จะไม่แสดงในหน้าร้าน

## พัฒนาในเครื่อง

```bash
cd site
npm install
npm run build
npm run dev
```

ห้าม commit ค่า Supabase จริง, session cookie หรือรหัสผ่านลง Git
