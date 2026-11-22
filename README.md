# FAIRHIRE AI v7.1 — Double-Judge Fixed Edition

**AI-Powered Fair & Explainable Recruitment Assistant**

A working local MVP for creating jobs, extracting requirements, uploading resumes, anonymizing applicants, transparent candidate matching, 3D coordinate ranking, score explanations and human shortlist/reject decisions.

## Stack
- React + TypeScript + Vite + Tailwind CSS
- Node.js + Express
- Local persistent JSON data store
- Google Gemini API (optional; backend only)
- PDF/DOCX/TXT resume parsing

## Zero database setup
No MongoDB, Docker, Supabase, Excel or database account is required. The backend automatically creates and maintains `backend/data/fairhire.json`. Uploaded resume files are saved under `backend/uploads/`. Data survives browser refreshes and app restarts.

## Run
```bash
npm install
npm run dev
```
Open `http://localhost:5173`. API health: `http://localhost:4000/health`.

## Demo data
First launch seeds:
- Senior MERN Stack Developer with 10 requirements
- Hospital Data Analyst
- HR Executive — Recruitment
- 4 MERN applicants with anonymized screening profiles and initial ranking data

## Scoring model
The backend retains the transparent deterministic model:
- Skills axis: weighted requirement average
- Experience axis: weighted requirement average
- Education axis: education + certification requirement average
- Weighted score = 50% Skills + 30% Experience + 20% Education
- 3D coordinate = `(Skills, Experience, Education)`
- Ideal coordinate = `(100,100,100)`
- Coordinate score = normalized inverse Euclidean distance from the ideal
- Final score = 75% Weighted Score + 25% Coordinate Score

Gemini is optional and is used for job/resume extraction when configured. Judge evidence handling and the final score are controlled by the backend. **The final score is calculated by Node/Express**, not by the LLM.

## Environment
Copy `.env.example` to `.env` only when you want Gemini. Never place the Gemini key in frontend code.


## Double-Judge screening architecture

This edition separates AI review into two stages:

1. **Judge 1 — Evidence Verifier** sees only the resume. It does not receive the job description, job requirements, scoring weights or ranking. It classifies extracted claims as document-supported, partially supported or not evidenced and records supporting resume lines plus confidence.
2. **Judge 2 — Blind Job Matcher** sees the job requirements plus Judge 1's verified anonymous profile. It does not receive candidate name, email, phone, address or raw resume. Evidence is type-locked so experience, education, skills and certifications cannot be mixed incorrectly.
3. **FAIRHIRE deterministic engine** calculates Skills, Experience and Education axis scores, the weighted score, 3D Euclidean coordinate score and final score. Neither judge chooses the final numeric rank.

The candidate detail screen exposes both judge stages so a recruiter can audit how evidence became a ranking.

## v8.0 ML-assisted ranking

FAIRHIRE now includes a lightweight unsupervised NLP relevance model. The model uses TF-IDF/cosine similarity on approved job requirements and the anonymous job-related profile only. It does not use historical hiring outcomes, recruiter decisions, names, contact details, or location.

- Transparent score: existing Skills + Experience + Education + 3D coordinate logic.
- ML relevance: 0–100 unsupervised text relevance score.
- Ranking score: 90% Transparent score + 10% ML relevance.

The candidate explanation page shows the model name, text similarity, required-term coverage and matched terms so the ML contribution remains auditable.
