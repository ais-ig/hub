# AIS British Section · Parent Information Hub

## What this project is

A single-link Parent Information Hub for Al-Rowad International Schools (AIS), Riyadh, covering the **British Section only, Boys and Girls, Grades 9 to 12**, for academic year 2026/27. Parents receive the link by WhatsApp before the first day of school and return to it all year. It is a practical reference, not a marketing page.

Commissioned by the Boys Principal (Mr. Fawaz) via email to all Heads of School. Scope was later narrowed to the British Section by Mr. Farhan Hussein, Head of British Section (Boys). Original requirements from the commissioning email, all still in force:

1. School systems and platforms: parent/student portals, communication channels, how to contact teachers and administration
2. Academic follow-up: weekly plans, student progress, homework/assignments, assessments, attendance, report cards
3. School timetable and hours: arrival, assembly, lesson timings, breaks, dismissal
4. Whether all grades attend from Day 1 or a staggered start applies
5. Arrival and dismissal procedures: gates, new traffic lanes, pick-up procedures
6. Parent services: Admissions, Finance, Books, Transportation, Student Affairs, IT support
7. School expectations: attendance, punctuality, uniform, conduct, safeguarding, parent responsibilities
8. Key contacts: departments and escalation channels per inquiry type

## Architecture (locked decisions, do not revisit)

- **One self-contained `index.html`** hosted on GitHub Pages (ais-ig org). All CSS and JS inline or in adjacent files in this repo. No build step, no framework, no external dependencies beyond Google Fonts.
- **Mobile-first.** Primary context is a WhatsApp link opened on a phone. Design at mobile width first; desktop is an enhancement.
- **Bilingual English/Arabic** with a visible language toggle. Full RTL mirroring in Arabic mode (`dir="rtl"`). Every user-facing string exists in both languages. Layout must survive mirroring; avoid left-anchored asymmetry.
- **Boys/Girls toggle.** The hub serves both campuses. Gates, traffic lanes, bell schedule, and contacts differ by campus and filter on this toggle. Academic content (curriculum, assessment, expectations) is shared. Persist the choice in a JS variable only, never localStorage.
- **Hybrid content model.** Structural prose is static in the HTML. Volatile fields hydrate from a published Google Sheet after page load: bell schedule, key dates, contacts, service hours, and one announcement banner. Every hydrated field has a baked-in fallback value in the HTML so the page is complete even if the fetch fails or is slow. See `SHEET-SCHEMA.md` for the exact schema. Fetch the published-to-web CSV endpoints, parse, replace field contents in place. No loading spinners for hydration; the static values simply update.
- **Announcement banner**: dismissible, homepage top, driven by the `Announcement` sheet tab (show flag + expiry date). Hidden entirely when no active announcement.

## Content structure

Nine sections, in this order: 1 Welcome + quick-start, 2 School hours and timetable, 3 Arrival and dismissal, 4 Systems and platforms, 5 Academic follow-up, 6 Parent services, 7 School expectations, 8 Key contacts and escalation, 9 FAQ. Details, placeholders, and pending items per section are in `CONTENT.md`.

## Design direction

Visual sibling of the existing Grade 8 Pathway Hub: https://ais-ig.github.io/grade-8-pathway/ · same school, same design language, evolved not cloned. Read its live CSS for reference. Card-based sections, section navigation, contact cards, FAQ accordion are established patterns to reuse.

## Brand rules (never violate)

- Navy `#1D5394`, deep navy `#0C2E54`, yellow `#EDBA1D`. No other accent colors.
- Poppins only, weights 300 / 400 / 500 / 700. Never 600 or 800.
- Emblem: `assets/emblem.png`, transparent, use as-is. Never recolor, never place on clashing backgrounds.
- No stock photography of people. Emblem, color, typography, and simple iconography carry the identity.
- Institutional, warm, trustworthy tone. A school, not a startup.

## Writing rules (never violate)

- **"Grade", never "Year".** Grade 9, Grade 12, IG classes, A-Levels. Parents never see "Year 10".
- **No em dashes anywhere**, in any language, in code comments, in content, in commit messages. Use en dashes for ranges (Grades 9–12) and middots (·) as dividers.
- English parent-facing tone: clear, concise, warm. Address the reader as "you". Arabic renders formal-respectful (فصحى), not colloquial.
- Islamic greeting conventions where used: parent-facing greeting is transliterated "Assalaamu Alaykum" in English contexts.
- Section head sign-off convention: personal messages sign "Farhan Hussein, Head of British Section (Boys)"; institutional content signs "British Section".

## Key people (for contacts content)

- Boys: Mr. Farhan Hussein, Head of British Section (Boys) · Mr. Tariq Saeed, Deputy (t.saeed@ais.sch.sa)
- Girls: Ms. Shamsiya Alkalbani, Head of School, Girls (s.alkalbani@ais.sch.sa) · Ms. Malak Rajeh, British Girls Deputy (m.alkhasawna@ais.sch.sa)

## Workflow expectations

- Skeleton first: full structure, real navigation, bilingual toggle working, hydration layer wired, placeholder content clearly plausible (not lorem ipsum, not "TBC"). A shareable link matters more than complete content.
- Commit in small, described steps. Verify mobile layout at ~380px width and RTL mode before considering any section done.
- When real content arrives, it replaces placeholders section by section; update `CONTENT.md` checkboxes as sections go live.
