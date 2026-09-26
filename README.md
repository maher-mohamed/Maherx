<div align="center">

# 🎮 MAHERX Games

### منصة ألعاب ماهر إكس التفاعلية — العب مع صحابك أونلاين!

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## 📖 نبذة عن المشروع

**MAHERX Games** هي منصة ألعاب جماعية تفاعلية تعمل في الوقت الفعلي (Real-time)، مصممة للأصدقاء والعائلات. يمكن للاعبين إنشاء غرف خاصة والانضمام إليها عبر رمز فريد مكون من 5 أحرف، واللعب معاً مباشرة من المتصفح بدون أي تحميل.

المنصة مبنية بالكامل بـ **TypeScript** (Strict Mode) على الـ Frontend والـ Backend، مع اتصال فوري عبر **WebSockets** باستخدام **Socket.IO**.

---

## 🎯 الألعاب المتوفرة

### 🕵️‍♂️ لعبة 1: مين الكداب؟ (The Impostor)

لعبة ذكاء وتخفّي مستوحاة من ألعاب الكلمات السرية!

| المرحلة | الوصف |
|---------|-------|
| **توزيع الأدوار** | السيرفر يختار كلمة سرية وفئة. كل اللاعبين يعرفون الكلمة ما عدا **الكداب** اللي بيعرف الفئة بس |
| **جولة النقاش** | كل لاعب يقول تلميح ذكي يثبت إنه يعرف الكلمة — بدون ما يكشفها! |
| **التصويت** | الجميع يصوتون على اللاعب اللي يشكّوا إنه الكداب |
| **تخمين الكداب** | لو الكداب اتكشف، عنده فرصة أخيرة يخمّن الكلمة وينقذ نفسه! |
| **النتائج** | توزيع النقاط حسب الأداء — الكداب الذكي ياخد نقاط! |

### 🎨 لعبة 2: لوّن المعنى (Fake Artist)

لعبة رسم جماعية تفاعلية مع لوحة رسم مشتركة!

| المرحلة | الوصف |
|---------|-------|
| **توزيع الأدوار** | السيرفر يختار كلمة سرية ويعيّن **الرسام الفاشل** اللي ما يعرفش الكلمة |
| **أدوار الرسم** | كل لاعب يرسم خط واحد على اللوحة المشتركة بالدور (12 ثانية لكل دور) |
| **التصويت** | بعد انتهاء الأدوار، الجميع يصوتون على الرسام الفاشل المشتبه فيه |
| **تخمين الرسام** | لو الرسام الفاشل اتكشف، عنده 15 ثانية يخمّن الكلمة السرية |
| **النتائج** | توزيع النقاط — الرسام الفاشل الذكي يقدر يسرق الفوز! |

---

## 🏗️ الهيكل المعماري (Architecture)

```
Maherx/
├── client/                    # Frontend — React + Vite + Tailwind
│   ├── public/
│   │   └── assets/            # صور الشعارات والأيقونات
│   ├── src/
│   │   ├── components/        # مكونات React
│   │   │   ├── Header.tsx          # شريط التنقل العلوي
│   │   │   ├── Lobby.tsx           # صفحة اللوبي واختيار اللعبة
│   │   │   ├── CreateRoomModal.tsx  # مودال إنشاء غرفة
│   │   │   ├── JoinModal.tsx       # مودال الانضمام لغرفة
│   │   │   ├── LeaderboardModal.tsx # مودال لوحة الصدارة
│   │   │   └── games/
│   │   │       ├── ImpostorGame.tsx  # واجهة لعبة مين الكداب
│   │   │       ├── FakeArtistGame.tsx # واجهة لعبة لوّن المعنى
│   │   │       └── CanvasBoard.tsx   # لوحة الرسم التفاعلية
│   │   ├── hooks/
│   │   │   └── useSocket.ts        # React Hook للـ Socket.IO
│   │   ├── types/
│   │   │   └── game.ts            # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── sound.ts           # مدير المؤثرات الصوتية
│   │   ├── App.tsx                 # المكون الرئيسي
│   │   ├── main.tsx                # نقطة البداية
│   │   └── index.css               # الأنماط العامة
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                    # Backend — Node.js + Express + Socket.IO
│   └── src/
│       ├── server.ts               # نقطة بداية السيرفر
│       ├── types/
│       │   └── index.ts            # TypeScript interfaces مشتركة
│       ├── data/
│       │   └── arabicQuestions.ts   # بنك الكلمات والأسئلة العربية
│       ├── controllers/
│       │   └── roomController.ts   # إدارة الغرف واللاعبين
│       ├── games/
│       │   ├── impostorEngine.ts   # محرك لعبة مين الكداب
│       │   └── mostLikelyEngine.ts # محرك إضافي
│       └── sockets/
│           └── gameHandler.ts      # معالج أحداث Socket.IO
│
├── package.json               # Root package.json
├── .gitignore
└── README.md
```

---

## ⚡ التقنيات المستخدمة (Tech Stack)

| الطبقة | التقنيات |
|--------|---------|
| **Frontend** | React 18, TypeScript (Strict), Vite 5, Tailwind CSS 3 |
| **Backend** | Node.js, Express.js, TypeScript (Strict) |
| **Real-time** | Socket.IO (WebSockets with Rooms) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Sound** | Web Audio API (Custom Sound Manager) |

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات
- **Node.js** v18+ ([تحميل](https://nodejs.org/))
- **npm** v9+

### خطوات التشغيل

#### 1. استنساخ المشروع
```bash
git clone https://github.com/maher-mohamed/Maherx.git
cd Maherx
```

#### 2. تثبيت الحزم
```bash
# تثبيت حزم السيرفر
cd server
npm install

# تثبيت حزم العميل
cd ../client
npm install
```

#### 3. تشغيل السيرفر (Backend)
```bash
cd server
npm run dev
```
> السيرفر يعمل على `http://localhost:4000`

#### 4. تشغيل العميل (Frontend)
```bash
cd client
npm run dev
```
> الموقع يعمل على `http://localhost:3000`

---

## 🎮 كيفية اللعب

1. **افتح الموقع** في المتصفح
2. **أنشئ غرفة** كمضيف — حدد اسمك، عدد اللاعبين (2-16)، وكلمة سر اختيارية
3. **شارك رمز الغرفة** (5 أحرف) مع أصدقائك
4. **اختر لعبة** من اللوبي
5. **ابدأ اللعب** واستمتعوا! 🎉

---

## 🔧 المميزات التقنية

- ✅ **TypeScript Strict Mode** — كود آمن بدون أخطاء وقت التشغيل
- ✅ **WebSocket Rooms** — كل غرفة معزولة تماماً
- ✅ **State Machine Pattern** — إدارة حالات اللعبة بشكل منظم
- ✅ **Auto-Reconnection** — إعادة اتصال تلقائية عند انقطاع النت
- ✅ **Host Migration** — نقل صلاحيات المضيف تلقائياً
- ✅ **Sound Effects** — مؤثرات صوتية تفاعلية
- ✅ **Responsive Design** — يعمل على الموبايل والديسكتوب
- ✅ **RTL Support** — دعم كامل للغة العربية
- ✅ **Custom Modals** — نوافذ تأكيد مخصصة بتصميم احترافي
- ✅ **Shared Canvas** — لوحة رسم مشتركة في الوقت الفعلي
- ✅ **Arabic Content** — بنك كلمات وأسئلة عربي غني

---

## 📱 Screenshots

| الصفحة الرئيسية | اللوبي | لعبة مين الكداب |
|:---:|:---:|:---:|
| Landing Page | Lobby & Game Selection | Impostor Game |

---

## 👤 المطور

**Maher Mohamed**

- GitHub: [@maher-mohamed](https://github.com/maher-mohamed)

---

## 📄 الرخصة

هذا المشروع مرخص بموجب رخصة [MIT](LICENSE).

---

<div align="center">

**صُنع بـ ❤️ في مصر 🇪🇬**

</div>
