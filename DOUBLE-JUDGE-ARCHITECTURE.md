# FAIRHIRE AI v7.1 — Double-Judge Architecture

## Stage 1 — Judge 1: Evidence Verifier
Input: extracted anonymous job-relevant resume profile + raw resume text.

Isolation guarantee in code: `judge1VerifyEvidence(profile, resumeText)` has no job-description or requirements parameter.

Judge 1 classifies claims as:
- `document_supported`
- `partially_supported`
- `not_evidenced`

It records typed evidence for skills, experience, education, and certifications.

## Stage 2 — Judge 2: Blind Job Matcher
Input: job requirements + Judge 1-verified anonymous profile/evidence.

Judge 2 does not receive candidate name, email, phone, address, or raw resume.

Evidence is type-locked:
- skill requirement -> skill claims only
- experience requirement -> experience/duration evidence only
- education requirement -> education evidence only
- certification requirement -> certification evidence only

This prevents errors such as using a JavaScript certification as evidence of three years' experience.

## Stage 3 — Deterministic FAIRHIRE scoring
The server calculates:
- Skills axis
- Experience axis
- Education axis
- Weighted score = 50% Skills + 30% Experience + 20% Education
- 3D coordinate = (Skills, Experience, Education)
- Coordinate score from Euclidean distance to (100,100,100)
- Final score = 75% Weighted + 25% Coordinate score

Neither Judge 1 nor Judge 2 writes the final ranking directly.

## UI proof
Candidate Details visibly shows:
- Double-Judge audit ACTIVE / NOT GENERATED
- Judge 1 panel
- Judge 2 panel
- Judge 1 evidence claims
- Judge 2 requirement-by-requirement evidence
- deterministic scoring formula

Use the `Run Double-Judge Review` button to regenerate an old or legacy candidate score.
