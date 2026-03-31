# 🌍 The Carbon Reality Project
### *Uncovering the truth behind global emissions, energy, and climate progress*

**Submission for:** Data & AI Hackathon 2026 - University of Leeds
**Track:** Track 2 - Earth, Environment & Climate

**Live Dashboard:** https://illusionofclimateprogression.netlify.app/

---

## 🧠 Project Overview

> *"Are we actually reducing emissions… or just reshaping them?"*

The **Carbon Reality Project** is a multi-layered data storytelling and analysis system that challenges conventional narratives around climate progress. While headlines celebrate falling emissions in developed nations and the rise of renewable energy, this project asks harder questions:

- Are emissions truly decreasing globally - or being **outsourced and hidden**?
- Do renewables actually reduce emissions, or do they **coexist with continued fossil fuel growth**?
- Who is **actually responsible**, and what does *fairness* look like?

The project is built around three interconnected analytical segments, each answering a different part of the climate puzzle, powered by a unified data pipeline processing 380+ EIA datasets covering 231 countries from 1980 to 2023.

---

## 🚀 Live Demo

👉 **https://illusionofclimateprogression.netlify.app/**

Open in any modern browser - no installation required.

---

## 🧩 Project Structure

```
Data-and-AI-Hackathon-2026/
│
├── Datasets Used/                          ← Source datasets used in the project
│
├── Hosted HTML/                            ← The interactive dashboard HTML file
│
├── Python Notebooks Used/                  ← Jupyter notebooks for data pipeline & analysis
│
└── README.md                               ← Project documentation
```

## 🔹 Segment 1 - Carbon Footprint Visual (Conceptual Layer)

> *"What does a country's carbon footprint actually look like?"*

This segment transforms raw emissions data into an intuitive, **visual carbon footprint** - making abstract numbers tangible for non-technical audiences. Instead of raw tonnes of CO₂, emissions are represented as:

- **Scaled footprint shapes** proportional to national output
- **Comparative impact** between countries side-by-side
- An immediate, emotional understanding of scale and responsibility

**Purpose:** Serve as the entry point - drawing in viewers before diving into deeper analysis.

---

## 🔹 Segment 2 - The Illusion of Climate Progress 📉🌍

> *"Did emissions actually fall… or just move abroad?"*

This is the **core analytical engine** of the project. It exposes how global emissions are redistributed through international trade, revealing that many celebrated emissions reductions in wealthy nations are statistical illusions.

### Key Features

**🌍 Carbon Outsourcing Map**
An interactive choropleth map visualising the gap between *production-based* and *consumption-based* emissions per country:
- 🔵 Blue → Net importers (consume more emissions than they produce)
- 🔴 Red → Net exporters (produce emissions on behalf of others)

**📉 Decoupling vs Outsourcing Analysis**
A quadrant scatter plot revealing **"Fake Decoupling"** - when a country's domestic emissions appear to fall, but consumption emissions rise or stay flat, meaning the pollution has simply been offshored.

| Axis | Meaning |
|------|---------|
| X-axis | Change in CO₂ intensity (true decoupling signal) |
| Y-axis | Outsourced emissions per capita (fairness signal) |

**⚖️ Carbon Accountability Score**
A custom composite fairness metric (0–100) evaluating each country across four dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Consumption emissions | 40% | Actual climate impact |
| Outsourcing behaviour | 30% | Fairness to other nations |
| GDP per capita | 30% | Capacity to act |
| Domestic reductions | Adjustment | Reward for genuine effort |

**🚨 Hidden Emissions Index**
Automatically flags countries where domestic emissions have fallen while consumption emissions have remained flat or risen - a key indicator of potential **greenwashing**.

### Core Metrics & Formulas

```
Outsourced CO₂        = Consumption CO₂ − Production CO₂

CO₂ Intensity         = CO₂ / GDP
ΔIntensity (%)        = ((Current − 2007) / 2007) × 100

Greenwashing Flag     = ΔProduction ≤ −5%  AND  ΔConsumption ≥ 0%

Accountability Score  = 0.4 × Norm(Consumption)
                      + 0.3 × Norm(Outsourcing)
                      + 0.3 × Norm(GDP)
                      [Adjusted for real reductions, normalised to 0–100]
```

### Core Insight

> Climate progress measured by **production emissions alone is misleading**. True accountability requires tracking where goods are consumed, not just where they are made.

---

## 🔹 Segment 3 - Carbon & Energy Explorer ⚡📊

> *"Do renewables actually reduce emissions - or just coexist with fossil fuels?"*

This segment explores the relationship between energy systems and carbon output, probing whether the renewable energy transition is genuinely displacing fossil fuels or simply running alongside them.

### Key Questions

- Does increasing renewable energy reduce CO₂ - or do fossil fuels continue to dominate?
- Are countries truly transitioning, or just **adding renewables on top** of existing fossil infrastructure?

### Analytical Dimensions

| View | What It Shows |
|------|--------------|
| CO₂ vs Fossil Fuels | Correlation between emissions and coal/oil/gas consumption |
| CO₂ vs Renewables | Whether renewable growth accompanies falling emissions |
| 3D Energy Model | Fossil fuels, renewables, and CO₂ plotted simultaneously over time |

An interactive **yearly slider (1990–2023)** lets users watch the global energy landscape evolve, with bubble size scaled to population to show the human scale behind the numbers.

### Core Insight

> **Renewable growth does not automatically mean emission reduction.** Many countries are adding clean capacity without retiring fossil infrastructure.

---

## ⚙️ Data Engineering Pipeline

This project transforms 380+ fragmented raw EIA files into a single unified analytical engine through a five-phase pipeline.

### Phase 1 - Data Audit & Categorisation

Raw files were organised into three functional domains:
- **Emissions** - CO₂ output in Million Metric Tons
- **Fossil Fuels** - Coal, natural gas, and petroleum consumption
- **Sustainability** - Renewables and total primary energy usage

### Phase 2 - The Cleaning Factory

Every file passed through four standardisation stages:

1. **Reshaping ("The Melt"):** EIA files use wide format (years as columns). We used `pd.melt()` to convert each to long format - one row per Country-Year observation.
2. **Unit Standardisation:** Data arrived in incompatible units (Short Tons, Billion Cubic Feet, Quadrillion BTU, etc.). Everything was normalised to **Terajoules (TJ)** and **Quadrillion BTU (QBTU)**.
3. **Data Scrubbing:** Placeholder values (`--`, `NA`) were converted to `0`; country names were standardised (e.g. `"U.S."` → `"United States"`) to ensure clean joins.
4. **Entity Labelling:** Rows were tagged as `Country` or `Aggregate` (e.g. "World", "EU27") to prevent double-counting during summations.

### Phase 3 - Multi-Stage Merging

The master dataset was built in layers, using **Country** and **Year** as primary join keys:

| Merge | Input Files | Output |
|-------|------------|--------|
| A - Fossil Master | Coal + Gas + Oil files | `MASTER_FOSSIL_FUELS_CONSUMPTION_1990_2023.csv` |
| B - Energy-Carbon Link | Fossil master + Emissions | `FINAL_MASTER_ENERGY_CO2_1990_2023.csv` |
| C - Socio-Economic Context | Energy + Population + GDP | `MASTER_TOTAL_EMISSIONS_ENERGY_SOCIO_1990_2023.csv` |
| D - Ultimate Join | All of the above | `ULTIMATE_EMISSIONS_MASTER_1990_2023.csv` |

### Phase 4 - Feature Engineering

Smart calculated columns were added to make the data tell a story:

- **`decoupling_category`** - Compares GDP growth vs CO₂ growth; tags countries as `Sustained Decoupling`, `Weak Decoupling`, or `Coupled`
- **`co2_per_capita`** - Per-person emissions for fair cross-country comparison
- **`co2_intensity_kg_per_usd`** - Emissions relative to economic wealth (carbon efficiency)
- **`renewable_share`** - Percentage of total energy from clean sources, per country per year
- **Logarithmic scaling** - Applied to enable small nations and large emitters to coexist visibly on the same charts

### Phase 5 - Powering the Interactive UI

The final master dataset was optimised for **Plotly.js**:
- Year column mapped to animation frames for the temporal slider
- Population column used to control bubble size in multi-dimensional charts
- Three axes prepared for the 3D Fossil / Renewables / CO₂ scatter plot

---

## 📊 Data Sources

| Source | What We Used |
|--------|-------------|
| [U.S. Energy Information Administration (EIA)](https://www.eia.gov/international/) | 386 CSV files - primary energy, fossil fuels, renewables, CO₂, GDP, population |
| [Our World in Data](https://ourworldindata.org/co2-and-greenhouse-gas-emissions) | Consumption-based emissions, trade-adjusted CO₂ |
| [Global Carbon Project](https://www.globalcarbonproject.org/) | Annual CO₂ budgets, land use, ocean/land sinks |

---

## 🖥️ How to Run

### Option 1 - View the Live Dashboard (Recommended)

Simply open: **https://illusionofclimateprogression.netlify.app/**

No installation required.

### Option 2 - Open Locally

```bash
# Clone the repository
git clone <your-repo-url>
cd carbon-reality-project

# Open the dashboard directly in your browser
Hosted HTML - index.html
```

### Option 3 - Rebuild the Data Pipeline

If you want to regenerate the master datasets from raw EIA files:

**Prerequisites:**
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) package manager

**Dependencies:** `pandas`, `numpy` 

```bash
# Install uv (if not already installed)
curl -Lsf https://astral.sh/uv/install.sh | sh

```


## 🚨 Key Takeaways

1. **We are not reducing emissions - we are redistributing them.** Developed nations appear to be decoupling from carbon, but much of this is achieved by offshoring production to countries with weaker environmental regulations.

2. **Renewable growth alone is not enough.** Many countries are adding solar and wind capacity without retiring coal and gas plants, meaning total energy consumption - and total emissions - continues to rise.

3. **Accountability requires consumption-based accounting.** A country that imports goods made with dirty energy abroad is just as responsible for those emissions as if it had burned the fuel at home.

---

## 👥 Team

| Name | Email |
|------|-------|
| Krithik Sharan Suresh Alagianayagi | mxnp0398@leeds.ac.uk |
| Uday Kiran Reddy Mule | gfqr0053@leeds.ac.uk |
| Haritej Karimisetti | tctn0725@leeds.ac.uk |
| Asjad Moiz Khan | gfqs0308@leeds.ac.uk |

**Programme:** MSc Data Science and Analytics
**Institution:** University of Leeds

Submitted to the **Data & AI Hackathon 2026**, University of Leeds
Track 2: Earth, Environment & Climate
