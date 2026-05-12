# ST Dance Studio — React საიტი

WordPress-ის ჩანაცვლება სუფთა, სწრაფი React + Vite საიტით,
Vercel-ზე გაშვებისთვის.

---

## ლოკალურად გაშვება

დაგჭირდება **Node.js 18+** (https://nodejs.org).

```bash
# 1. დააინსტალირე დამოკიდებულებები
npm install

# 2. გაუშვი dev server (http://localhost:5173)
npm run dev

# 3. ააწყვე საბოლოო ბილდი (dist/)
npm run build

# 4. ადგილობრივად ნახე ბილდი
npm run preview
```

---

## Vercel-ზე გაშვება

### ვარიანტი 1 — Vercel Dashboard-ით (უმარტივესი)

1. ატვირთე ეს პროექტი GitHub/GitLab-ზე ცალკე რეპოდ.
2. შედი https://vercel.com → **Add New** → **Project**.
3. აარჩიე რეპო → Vercel ავტომატურად ამოიცნობს Vite-ს.
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. დააწექი **Deploy**. ყველაფერი 1–2 წუთში ცოცხალი იქნება.

### ვარიანტი 2 — Vercel CLI-თ

```bash
npm i -g vercel
vercel login
vercel       # preview deploy
vercel --prod  # production deploy
```

### დომენი (stdance.ge)

Vercel Dashboard-ში → Project → **Settings** → **Domains** →
დაამატე `stdance.ge`. Vercel მოგცემს DNS ჩანაწერებს, რომლებიც
უნდა დააკონფიგურირო შენს დომენ-რეგისტრატორთან.

---

## პროექტის სტრუქტურა

```
stdance-react/
├── public/
│   └── images/             ← ლოგო, სურათები (ყველაფერი აქედან /images/...)
├── src/
│   ├── components/
│   │   ├── Header.jsx      ← ნავიგაცია, mobile drawer
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── pages/
│   │   ├── Home.jsx        ← მთავარი
│   │   ├── About.jsx
│   │   ├── Programs.jsx
│   │   ├── Teachers.jsx
│   │   ├── Competitions.jsx
│   │   ├── Contact.jsx
│   │   └── NotFound.jsx
│   ├── data/
│   │   └── content.js      ← ⭐ მთელი ტექსტი/კონტენტი ერთ ფაილში
│   ├── styles/
│   │   └── global.css      ← ფერები, ფონტები, ცვლადები
│   ├── App.jsx             ← როუტინგი
│   └── main.jsx            ← ენტრი წერტილი
├── index.html
├── vite.config.js
├── vercel.json             ← SPA rewrites react-router-ისთვის
└── package.json
```

---

## კონტენტის რედაქტირება

**ყველა ტექსტი ცხოვრობს `src/data/content.js`-ში** — სახელები, აღწერები,
ტელეფონები, მისამართი, მასწავლებლები, კონკურსები, რივიუები. გახსენი ეს
ფაილი და შეცვალე — კოდს ხელი არ უნდა მოკიდო.

**სურათები ცხოვრობს `public/images/`-ში** — ჩაანაცვლე ფაილები იმავე
სახელებით (`logo.png`, `hero-1.png`, `competition.png` და ა.შ.) და
ყველგან განახლდება ავტომატურად.

---

## დიზაინი

- **ფერები:** შავი + ოქროსფერი (ლოგოსთან თანხმობაში)
- **ფონტები:** Cormorant Garamond (display), Manrope (body), Bebas Neue (accent)
- **ესთეტიკა:** editorial luxury — ცეკვის ფორმალურობა + სცენის სილაღე
- **რესპონსივი:** მუშაობს მობილურზეც, დესკტოპზეც

შეცვლა შეგიძლია `src/styles/global.css`-ში (CSS ცვლადები ზემოთ).

---

## კონტაქტ ფორმა

ახლა `Contact.jsx`-ში ფორმა მხოლოდ console-ში წერს მონაცემებს. რეალური
შეტყობინების გაგზავნისთვის შეგიძლია გამოიყენო:

- **Formspree** (https://formspree.io) — უფასო, action URL ერთი ცვლა
- **Resend + Vercel API Route** — ცოტა ტექნიკური, მაგრამ უფრო ელეგანტური
- **EmailJS** (https://emailjs.com) — frontend-only

ვითხოვ — და დავამატებ.

---

## შემდეგი ნაბიჯები (სურვილისამებრ)

- 📸 დაამატე უფრო მეტი ფოტო (`public/images/`)
- 🎬 დაამატე ვიდეო ჰერო (replace `<img>` with `<video>` in Home.jsx)
- 🌐 ენების გადართვა (i18n) — ენგლისური ვერსია
- 📝 ბლოგი (Markdown ფაილები + `gray-matter`)
- 📊 Google Analytics ან Plausible
- 🔔 WhatsApp/Telegram ღილაკი (floating)
