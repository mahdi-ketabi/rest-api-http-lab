# 🌐 REST API & HTTP Lab | آزمایشگاه HTTP و API

**JavaScript · Fetch · HTTP Methods · REST · JSON · Node.js (بدون کتابخانهٔ خارجی)**

یک محیط **قابل اجرا روی کامپیوتر** برای یادگیری عملی ارتباط Client–Server. صفحهٔ کاربری درخواست‌های واقعی HTTP را به API آزمایشی خود پروژه می‌فرستد؛ سرور با Node.js و کتابخانهٔ استاندارد `http` نوشته شده است.

> داده‌ها نمایشی‌اند و فقط در حافظهٔ سرور باقی می‌مانند. این پروژه یک سیستم فروش یا Backend تولیدی نیست، رمز عبور و احراز هویت ندارد و نباید به‌عنوان سرویس عمومی اینترنت منتشر شود.

## امکانات واقعی

- `GET /api/products` و `GET /api/products/:id` برای خواندن داده.
- `POST /api/products` برای ایجاد محصول (201 + `Location`).
- `PUT /api/products/:id` برای جایگزینی کامل؛ `PATCH` برای تغییر جزئی.
- `DELETE /api/products/:id` برای حذف (204، بدون بدنه).
- خطاهای آموزشی 400، 404، 405، 415، 500؛ سناریوی Timeout و Abort.
- مشاهدهٔ Method، Endpoint، Request Body، Status Code، Response Headers، Response Body و مدت پاسخ.
- بازنشانی داده‌های نمونه با `POST /api/reset`، رابط RTL واکنش‌گرا، کنترل ورودی و آزمون‌های خودکار HTTP.

## اجرا از صفر

1. از https://nodejs.org/en/download نسخهٔ **LTS** را نصب کن. نسخهٔ Node باید **۲۰ یا جدیدتر** باشد.
2. ZIP پروژه را استخراج کن؛ وارد پوشهٔ `rest-api-http-lab` شو.
3. Windows: در نوار آدرس File Explorer بنویس `cmd` و Enter بزن. macOS: Terminal را در همین پوشه باز کن.
4. این دستور را بزن:

```bash
npm start
```

5. در مرورگر برو به **http://localhost:5600**.
6. برای تست اتوماتیک در ترمینال دوم:

```bash
npm test
```

**نیازی به npm install نیست**؛ این برنامه هیچ Dependency خارجی ندارد. اگر پورت 5600 مشغول بود، در Windows `set PORT=5700 && npm start` یا در macOS/Linux `PORT=5700 npm start` و آدرس را متناسب عوض کن.

## سناریوی آزمایشی پیشنهادی

1. GET بدون شناسه → 200 و فهرست اولیهٔ سه محصول.
2. POST با اطلاعات نمونه → 201 و شناسهٔ محصول جدید.
3. PATCH برای همان شناسه → 200 و تغییر قیمت (در رابط فعلی سه فیلد ارسال می‌شود؛ API قابلیت PATCH تک‌فیلدی هم دارد).
4. GET همان شناسه → 200 و دادهٔ ویرایش‌شده.
5. DELETE همان شناسه → 204 و پاسخ خالی؛ GET مجدد → 404.
6. دکمه‌های خطا: 400 / 404 / 500 / Timeout، بررسی تفاوت HTTP Error و Network Error.
7. بازنشانی نمونه‌ها → فهرست اولیه دوباره ظاهر می‌شود.

## نمونهٔ درخواست و پاسخ

```http
POST /api/products HTTP/1.1
Content-Type: application/json

{"title":"کابل جدید","price":315000,"category":"cable"}
```

پاسخ مورد انتظار (شناسه بسته به درخواست‌های قبلی تغییر می‌کند):

```http
HTTP/1.1 201 Created
Location: /api/products/4
Content-Type: application/json

{"id":4,"title":"کابل جدید","price":315000,"category":"cable"}
```

## ساختار پروژه

```text
rest-api-http-lab/
├── public/
│   ├── index.html    # فرم درخواست و پنل پاسخ
│   ├── styles.css    # طراحی واکنش‌گرا
│   └── app.js        # Fetch، بررسی response.ok و Abort
├── src/
│   ├── server.mjs    # HTTP server + routing + status codes
│   └── store.mjs     # CRUD in-memory + validation
├── tests/api.test.mjs # تست متدها و status codes
└── package.json
```

## نکات دقیق مصاحبه

**HTTP در برابر HTTPS:** HTTPS همان ارتباط HTTP محافظت‌شده با TLS است. تمرین روی `localhost` با HTTP اجرا می‌شود؛ این به معنای HTTPS بودن سرور نیست.

**GET و DELETE و PUT:** در طراحی REST معمولاً idempotent هستند (تکرار همان درخواست نباید تغییر اثر نهایی ایجاد کند). POST به‌طور کلی idempotent نیست؛ PATCH *الزاماً* idempotent نیست، اگرچه در این API خاص برای به‌روزرسانی یک مقدار ثابت چنین رفتاری دارد.

**Fetch:** صرفاً دیدن کد 400 یا 404 معمولاً Promise مربوط به Fetch را reject نمی‌کند؛ باید `response.ok` بررسی شود. قطع اتصال، خطای شبکه یا Abort رفتار متفاوتی دارند.

**API و SDK:** API قرارداد ارتباط با سرویس است؛ SDK بسته‌ای از ابزارها/کتابخانه‌ها/مستندات برای استفادهٔ آسان‌تر از API یا پلتفرم است.

**CORS:** این تمرین از Same-Origin استفاده می‌کند (صفحه و API روی `localhost:5600`)؛ بنابراین ادعای پیاده‌سازی و حل مسئلهٔ CORS ندارد. مرورگر معمولاً درخواست‌های Cross-Origin را طبق سیاست CORS محدود می‌کند.

**Authentication:** این API آموزشی بدون ورود کاربر است و نباید ادعای JWT یا Session Authentication برای آن داشته باشیم.

**ذخیره‌سازی:** داده در آرایهٔ حافظهٔ Node نگهداری می‌شود. با خاموش‌شدن سرور، به حالت اولیه بازمی‌گردد؛ این پروژه Database یا SQLite ندارد.

## تست و Debug

- در مرورگر F12 → Network را باز کن؛ Method، Status، Headers، Payload، Response را مشاهده کن.
- `npm test` تست‌های CRUD، خطا، header و Reset را اجرا می‌کند.
- برای تمرین واقعی Git، بعد از مطالعه یک تغییر کوچک و معنادار در README/کد بده، Commit کن و Diff را بررسی کن.

## انتشار در GitHub

این مخزن باید **Public** باشد تا بررسی‌کننده بتواند کد را ببیند. **GitHub Pages سرور Node.js را اجرا نمی‌کند**؛ برای این پروژه فقط لینک **Code** بده، نه لینک Live جعلی. برای مشاهدهٔ برنامه، بررسی‌کننده می‌تواند طبق README با `npm start` روی کامپیوتر اجرا کند.

نسخهٔ اولیه با کمک AI تهیه شده است؛ لازم است صاحب مخزن آن را اجرا، بازخوانی و تغییر دهد و بتواند منطقش را مستقل توضیح دهد.

## منابع فنی

- MDN HTTP Methods: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
- MDN Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
- MDN Fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
- Node HTTP: https://nodejs.org/api/http.html
- Node Test: https://nodejs.org/api/test.html
