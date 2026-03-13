# 💊 RxFood — Drug-Food Interaction Visualizer

> Know what NOT to eat with your medication. Visualize chemical interactions between drugs and food at a molecular level.

![RxFood Banner](https://img.shields.io/badge/RxFood-Drug--Food%20Visualizer-00d4ff?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-16%2B-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)



## ✨ Features
- 🔍 **Search 35+ drugs** with autocomplete
- ⚗️ **Chemical mechanism explanations** — not just "avoid grapefruit" but WHY at the enzyme level
- 🧬 **Molecular structure visualizations** for every interaction
- 🔬 **Step-by-step interaction pathways** — see exactly what happens in your body
- 🎯 **3 risk levels** — High / Medium / Low with color coding
- 📊 **Analytics Dashboard** — stats, charts, most dangerous drugs/foods
- 🌐 **REST API** — use the data in your own apps

---

## 🗂️ Project Structure

```
rxfood/
├── frontend/               # Static HTML/CSS/JS served by Express
│   ├── index.html          # Main app page
│   ├── dashboard.html      # Analytics dashboard
│   ├── css/
│   │   └── style.css       # All styles
│   └── js/
│       └── app.js          # Frontend logic — fetches from API
│
├── backend/                # Node.js + Express server
│   ├── server.js           # Main server entry point
│   ├── routes/
│   │   └── drugs.js        # All API route handlers
│   └── data/
│       └── drugs.json      # 📦 Full drug database (35 drugs, 100+ interactions)
│
├── dashboard/              # Dashboard source (also copied to frontend/)
│   └── dashboard.html
│
├── package.json            # Dependencies & scripts
├── .gitignore
└── README.md
```

---

## 🛠️ Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/rxfood.git
cd rxfood

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open browser
# http://localhost:3000
```

For development with auto-reload:
```bash
npm run dev
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drugs` | List all drugs with basic info |
| GET | `/api/drugs/search?q=warfarin` | Search drugs by name |
| GET | `/api/drugs/:name` | Full drug data + interactions |
| GET | `/api/drugs/:name/interactions` | Interactions only (filter by `?severity=high`) |
| GET | `/api/foods` | All foods sorted by number of drug interactions |
| GET | `/api/stats` | Database statistics for dashboard |
| GET | `/health` | Health check |

**Example:**
```bash
curl https://rxfood.onrender.com/api/drugs/warfarin
curl https://rxfood.onrender.com/api/drugs/search?q=met
curl https://rxfood.onrender.com/api/drugs/ciprofloxacin/interactions?severity=high
```

---

## 🚢 Deploy on Render (Free)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/rxfood.git
   git push -u origin main
   ```

2. **Go to [render.com](https://render.com)** → New → Web Service

3. **Connect your GitHub repo**

4. **Configure:**
   | Setting | Value |
   |---------|-------|
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Environment | `Node` |
   | Plan | Free |

5. **Click Deploy** — Render auto-deploys on every `git push`!

---

## 💊 Drugs in Database

| Category | Drugs |
|----------|-------|
| **Antibiotics** | Amoxicillin, Ciprofloxacin, Azithromycin, Doxycycline, Clarithromycin, Levofloxacin, Metronidazole |
| **Diabetes** | Metformin, Glimepiride, Sitagliptin, Pioglitazone |
| **Heart/BP** | Amlodipine, Lisinopril, Losartan, Metoprolol, Atenolol |
| **Cholesterol** | Warfarin, Simvastatin, Atorvastatin, Rosuvastatin |
| **Mental Health** | Sertraline, Fluoxetine, Escitalopram, Phenelzine, Clonazepam |
| **Antihistamines** | Cetirizine, Levocetirizine, Loratadine, Montelukast |
| **Antacids (PPI)** | Omeprazole, Pantoprazole, Rabeprazole |
| **Pain/Fever** | Paracetamol, Ibuprofen, Aspirin |

---

## 🏆 Built for Hackathon

- **Problem:** Patients are harmed by drug-food interactions they don't know about
- **Solution:** Visual, chemistry-backed explanations that anyone can understand
- **Impact:** Potentially prevents dangerous interactions for millions of patients

---

## 📄 License
MIT — free to use, modify and deploy.
