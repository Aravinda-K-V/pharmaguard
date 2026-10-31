# PharmaGuard AI 🧬

<p align="center">
  <strong>AI-assisted pharmacogenomics and VCF-based drug–gene risk exploration</strong>
</p>

<p align="center">
  <a href="https://github.com/Aravinda-K-V/pharmaguard"><img src="https://img.shields.io/badge/GitHub-Repository-181717?logo=github" alt="GitHub repository"></a>
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-61DAFB?logo=react" alt="React and TypeScript">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Genomics-VCF%20%7C%20Pharmacogenomics-7B61FF" alt="VCF pharmacogenomics">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Android-3DDC84?logo=android" alt="Web and Android">
</p>

**PharmaGuard AI** is a pharmacogenomics project that explores how selected genetic variants can influence medication response. It combines a VCF (Variant Call Format) upload workflow, drug–gene mapping, diplotype and phenotype interpretation, rule-based risk analysis, a machine-learning quick-risk endpoint, and optional LLM-generated explanations.

The goal is to make pharmacogenomic concepts easier to explore by turning supported genetic-marker information into readable drug–gene insights.

> **Project scope:** PharmaGuard currently implements a targeted set of pharmacogenomic genes, variants, alleles, and medication rules. It is not a complete genome-wide variant annotator, diagnostic system, or replacement for a validated clinical pharmacogenomics laboratory or healthcare professional.

---

## Contents

- [Overview](#overview)
- [Key capabilities](#key-capabilities)
- [How it works](#how-it-works)
- [Supported genes and example drug associations](#supported-genes-and-example-drug-associations)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Using PharmaGuard](#using-pharmaguard)
- [API overview](#api-overview)
- [VCF input notes](#vcf-input-notes)
- [Android app](#android-app)
- [Testing and development](#testing-and-development)
- [Limitations and clinical safety](#limitations-and-clinical-safety)
- [Contributing](#contributing)
- [Keywords and topics](#keywords-and-topics)
- [License](#license)

## Overview

Pharmacogenomics (PGx) studies how a person's genetic variation can affect their response to medicines. Variants in genes involved in drug metabolism, transport, or immune response may influence drug exposure, efficacy, or the likelihood of adverse reactions.

PharmaGuard is designed as an educational and development platform for exploring this relationship:

1. Provide genetic information by uploading a supported VCF file or entering a gene and variant manually.
2. Select one or more medications.
3. Map supported variants to genes and allele labels.
4. Evaluate the available genotype/phenotype information against the project's drug-specific rules.
5. Review a structured risk summary, pharmacogenomic profile, and explanation.

## Key capabilities

| Capability | Description |
|---|---|
| **VCF upload** | Upload a `.vcf` file for targeted pharmacogenomic marker parsing. |
| **Manual variant input** | Enter a gene and star-allele/variant value for a focused analysis. |
| **Drug–gene mapping** | Associate supported medications with genes represented in the project's mapping tables. |
| **Diplotype formatting** | Format supported star-allele values into diplotype-like labels. |
| **Phenotype interpretation** | Apply project-defined activity and phenotype rules for selected genes. |
| **Rule-based analysis** | Generate medication-specific risk labels and recommendations from the implemented rules. |
| **Quick risk prediction** | Call a separate ML endpoint using patient and medication fields. |
| **AI explanations** | Optionally request a natural-language explanation through the Groq API. |
| **Multiple medications** | Submit more than one medication for analysis. |
| **Web and Android packaging** | React web frontend with Capacitor Android project and a repository APK. |

## How it works

```text
VCF file / Manual gene + variant
              |
              v
   Targeted variant parsing
              |
              v
    Gene and allele mapping
              |
              v
   Diplotype / phenotype rules
              |
              v
       Drug–gene rules
              |
       +------+------+
       |             |
       v             v
  Risk result    Optional LLM
       |         explanation
       +------+------+
              |
              v
    Results in the web UI
```

### Main analysis components

- **VCF parser — `vcf_parser.py`:** Reads VCF records, looks for gene/allele annotations in the INFO field, and maps a configured set of rsIDs to known project allele labels.
- **Gene mapper — `gene_mapper.py`:** Maps medication names and aliases to genes used by the analysis flow.
- **Phenotype engine — `phenotype_engine.py`:** Applies the project's allele-activity and phenotype classification rules.
- **Rule engine — `rule_engine.py`:** Evaluates supported medication and gene combinations and constructs risk/recommendation results.
- **ML prediction — `main.py`:** Loads the serialized model and encoders in `models/` for the quick-risk prediction endpoint.
- **LLM explanation — `llm_engine.py`:** Uses Groq when `GROQ_API_KEY` is configured; fallback text is returned when the LLM is unavailable.
- **Frontend PGx engine — `src/services/pharmacogenomicsEngine.ts`:** Contains client-side pharmacogenomic helpers and analysis logic used by the dashboard.

## Supported genes and example drug associations

The repository contains rules and mappings involving genes such as:

- `CYP2C19`
- `CYP2C9`
- `CYP2D6`
- `SLCO1B1`
- `VKORC1`
- `HLA-B`
- `TPMT`
- `NUDT15`
- Additional gene symbols appear in some medication mappings and frontend logic.

Examples of medication associations represented in the project include:

| Medication examples | Gene(s) represented in project mappings |
|---|---|
| Clopidogrel, omeprazole, esomeprazole, pantoprazole, voriconazole, selected SSRIs | `CYP2C19` |
| Warfarin | `CYP2C9`, `VKORC1` |
| Codeine, tamoxifen | `CYP2D6` |
| Simvastatin | `SLCO1B1` |
| Carbamazepine, abacavir, allopurinol | `HLA-B` |
| Phenytoin | `CYP2C9`, `HLA-B` |
| Azathioprine | `TPMT`, `NUDT15` |

The exact supported combinations depend on the current frontend and backend implementation. A gene appearing in a mapping does not mean every clinically relevant allele, variant, phenotype, or guideline for that gene is implemented.

## Technology stack

**Frontend**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui and Radix UI components
- Recharts
- Capacitor for Android packaging

**Backend**
- Python
- FastAPI
- Uvicorn
- Pandas and NumPy
- scikit-learn and Joblib
- python-dotenv
- python-multipart
- Groq SDK (optional LLM explanation)

## Repository structure

```text
pharmaguard/
├── README.md
├── pharmaguard-app.apk
├── pharmaguard-backend-main/
│   ├── main.py                 # FastAPI application and endpoints
│   ├── app.py                  # App entry point/re-export
│   ├── vcf_parser.py           # Targeted VCF parser and rsID mappings
│   ├── gene_mapper.py          # Medication-to-gene mappings
│   ├── phenotype_engine.py     # Allele and phenotype rules
│   ├── rule_engine.py          # Drug–gene risk rules
│   ├── llm_engine.py           # Optional Groq explanation generation
│   ├── train_model.py          # ML model training code
│   ├── test_model.py           # Model test script
│   ├── requirements.txt
│   └── models/
│       ├── pharmaguard_model.pkl
│       ├── encoders.pkl
│       └── target_encoder.pkl
└── pharmaguard-frontend-main/
    ├── src/
    │   ├── pages/              # Landing page, dashboard, how-to-use
    │   ├── components/         # UI and dashboard components
    │   ├── services/
    │   │   └── pharmacogenomicsEngine.ts
    │   └── data/
    ├── android/                # Capacitor Android project
    ├── public/
    ├── package.json
    ├── .env.example
    └── vite.config.ts
```

## Getting started

You need **Python 3.10+**, **Node.js**, and **npm** installed. Use two terminal windows: one for the backend and one for the frontend.

### 1. Clone the repository

```bash
git clone https://github.com/Aravinda-K-V/pharmaguard.git
cd pharmaguard
```

### 2. Start the backend

```bash
cd pharmaguard-backend-main

# Create and activate a virtual environment
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

# Install Python dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend should be available at:

- API root: http://localhost:8000/
- Interactive API documentation: http://localhost:8000/docs

The model files under `pharmaguard-backend-main/models/` are used by the quick-risk prediction endpoint. Keep the three model/encoder files together in that directory.

### 3. Configure and start the frontend

Open a **second terminal** from the repository root:

```bash
cd pharmaguard-frontend-main

# Install JavaScript dependencies
npm install

# Create your local environment file
cp .env.example .env
```

Edit `.env` and set the backend URL:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite (the project config uses port **8080**).

### 4. Build the frontend

```bash
cd pharmaguard-frontend-main
npm run build
```

The production build is generated in the frontend's `dist/` directory.

## Configuration

### Frontend environment

The frontend reads the backend base URL from:

```env
VITE_BACKEND_URL=http://localhost:8000
```

For deployment, replace this with the URL of your deployed FastAPI service. Do not commit private credentials or local-only environment files.

### Optional Groq API key

To enable LLM-generated explanations, create a `.env` file in `pharmaguard-backend-main/`:

```env
GROQ_API_KEY=your_groq_api_key
```

Restart the backend after changing environment variables. The application includes fallback explanation handling if the LLM is not configured or a request fails.

**Security:** Never publish a real API key, password, token, or private credential in GitHub. If a key has been committed, revoke/rotate it and remove it from the repository history as appropriate.

## Using PharmaGuard

1. Launch the PharmaGuard web application.
2. Open the analysis dashboard.
3. Upload a supported VCF file, or enter a gene and variant manually.
4. Select one or more medications from the available list.
5. Choose the available analysis mode and submit.
6. Review the result's risk label, pharmacogenomic profile, diplotype/phenotype fields, and explanation.
7. Treat the output as an exploratory result that requires clinical verification.

The dashboard also exposes a quick-risk workflow that accepts patient and medication details separately from the VCF-based pharmacogenomic analysis.

## API overview

The backend is a FastAPI application. The principal routes implemented in `main.py` include:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Backend health/status response, including model and AI configuration state. |
| `POST` | `/analyze` | Drug-focused pharmacogenomic analysis. Accepts JSON or multipart form data; file upload is supported through the form workflow. |
| `POST` | `/predict` | ML quick-risk prediction from structured patient and medication fields. |

Use the interactive Swagger UI at `http://localhost:8000/docs` to inspect request schemas and try the endpoints.

### Example analysis request

Manual input can be submitted as JSON:

```json
{
  "drug": "OMEPRAZOLE",
  "gene": "CYP2C19",
  "variant": "*2",
  "mode": "patient"
}
```

For VCF upload, use `multipart/form-data` with a `file` field and the required `drug` field. The precise accepted fields and response shape are defined in the current FastAPI implementation.

## VCF input notes

VCF (Variant Call Format) is a common text format for representing genetic variants. PharmaGuard's current parser is **targeted**, not a universal VCF annotation pipeline.

The backend parser currently:
- Skips VCF header/comment lines.
- Reads variant identifiers and the INFO field.
- Looks for project-specific `GENE=`, `STAR=`, or `ALLELE=` annotations.
- Maps a configured set of known rsIDs to gene and star-allele labels when possible.
- Uses genotype information in the sample column in a limited way when a star-allele label is available.

A few rsIDs present in the backend mapping include `rs4244285`, `rs4986893`, `rs12248560`, `rs1799853`, `rs1057910`, `rs3892097`, and `rs4149056`. The exact mapping is maintained in `pharmaguard-backend-main/vcf_parser.py`.

**Important input considerations**
- Use a valid, tab-delimited VCF file with the expected columns.
- The parser does not perform comprehensive genome alignment, variant calling, phasing, normalization, or annotation.
- A VCF without recognized identifiers or expected INFO annotations may produce few or no recognized variants.
- A single detected allele should not automatically be treated as a fully resolved clinical diplotype.
- The repository's parser does not establish that a VCF is a complete or clinically validated patient genome.

## Android app

The repository contains a Capacitor Android project under `pharmaguard-frontend-main/android/` and a prebuilt APK at the repository root.

To build/synchronize the web application for Android (with the Android SDK and Android Studio configured):

```bash
cd pharmaguard-frontend-main
npm install
npm run build:app
```

To open the Android project in Android Studio:

```bash
npm run cap:open
```

The APK included in the repository may not correspond to the latest source changes. Rebuild it after updating the frontend.

## Testing and development

Frontend scripts available in `pharmaguard-frontend-main/package.json`:

```bash
npm run dev        # Start Vite development server
npm run build      # Create production build
npm run lint       # Run ESLint
npm run test       # Run Vitest tests once
npm run test:watch # Run Vitest in watch mode
```

Backend helper scripts include:

```bash
cd pharmaguard-backend-main
python test_model.py
```

Run tests in a controlled development environment and verify the behavior against known test cases before relying on output.

## Limitations and clinical safety

PharmaGuard is a software development and educational project. It must not be used as the sole basis for selecting a medicine, changing a dose, stopping treatment, or diagnosing a condition.

- The current variant parser recognizes only a limited set of markers and expected annotations.
- Star-allele calling and diplotype inference are simplified; many genes require more comprehensive methods, including copy-number analysis, phasing, and specialized variant interpretation.
- The implemented drug–gene rules are not a substitute for checking current CPIC, DPWG, FDA, PharmGKB, or locally applicable prescribing guidance.
- A machine-learning risk score is not proof of an individual's clinical risk and may reflect limitations in the model's training data.
- LLM-generated explanations can be incomplete or incorrect and should never override verified source data or professional judgment.
- A displayed risk category or recommendation should be independently reviewed by a qualified clinician or clinical pharmacist.

Do not upload identifiable or sensitive genetic information unless you understand the privacy, security, and data-handling implications of the environment where the application is running.

## Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make focused changes and add or update tests.
4. Run the relevant frontend/backend checks.
5. Open a pull request with a clear description of the change and test evidence.

For changes to genetic interpretation, include the source of the variant/gene/drug evidence and test cases covering the intended interpretation.

## Keywords and topics

This repository is relevant to developers and learners searching GitHub for:

**Genomics and bioinformatics:** genome, genomics, genetic data, genetic variants, variant analysis, bioinformatics, VCF, Variant Call Format, rsID, SNP, allele, star allele, diplotype, genotype, phenotype, pharmacogenomics, pharmacogenetics, PGx.

**Genes and medication response:** CYP2C19, CYP2C9, CYP2D6, SLCO1B1, VKORC1, HLA-B, TPMT, NUDT15, drug–gene interaction, drug metabolism, personalized medicine, precision medicine, adverse drug reaction, medication risk, drug response.

**AI and development:** machine learning, ML, LLM, Groq, clinical decision support (prototype), FastAPI, Python, React, TypeScript, Vite, Android, Capacitor.

If you are exploring **VCF parsing, pharmacogenomic variant interpretation, gene–drug mapping, diplotype/phenotype logic, or AI-assisted medication-risk prototypes**, this repository may be a useful starting point.

---

## License

No license file was present at the time this README was prepared. Unless a license is added, the repository's contents are not automatically granted an open-source reuse license. Add a `LICENSE` file to specify the terms under which others may use, modify, and distribute the project.

---

<p align="center">
  Built to explore the connection between <strong>genetic variation</strong> and <strong>medication response</strong>.
</p>
