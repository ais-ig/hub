# Google Sheet Schema · Hub Hydration Layer

The starter workbook `hub-data-starter.xlsx` in this package implements this schema exactly. Upload it to the school's Google Drive, convert to a Google Sheet, then File → Share → Publish to web, publishing **each tab as CSV**. The hub fetches those CSV URLs on load and replaces the matching elements' text. Every hydrated element in `index.html` carries a `data-hydrate` attribute named below and contains a baked-in fallback value.

Rules for the sheet itself: header rows are locked (row 1, bold, navy fill), one yellow-filled example row shows the expected format, edit access limited to 2–3 named staff. Editors change values only, never headers or tab names.

## Tab: Bell_Schedule

One row per timeslot per campus. Hub renders rows for the selected campus in row order.

| Column | Header | Example | Notes |
|---|---|---|---|
| A | Campus | Boys | `Boys` or `Girls` only |
| B | Item_EN | Assembly | |
| C | Item_AR | الطابور الصباحي | |
| D | Start | 7:00 | 24h H:MM |
| E | End | 7:15 | empty allowed (e.g., Arrival) |

`data-hydrate="bell.{campus}"` on the table body; hub rebuilds rows from CSV.

## Tab: Key_Dates

| Column | Header | Example | Notes |
|---|---|---|---|
| A | Date | 2026-08-23 | ISO format |
| B | Label_EN | First day of school | |
| C | Label_AR | اليوم الأول من الدراسة | |
| D | Campus | Both | `Boys`, `Girls`, or `Both` |
| E | Show | Yes | `Yes`/`No`; No hides without deleting |

`data-hydrate="dates"` list; sorted by date, past dates auto-hidden by the hub.

## Tab: Contacts

| Column | Header | Example | Notes |
|---|---|---|---|
| A | Campus | Boys | `Boys`, `Girls`, or `Both` |
| B | Role_EN | Deputy Head | |
| C | Role_AR | نائب رئيس القسم | |
| D | Name_EN | Mr. Tariq Saeed | |
| E | Name_AR | أ. طارق سعيد | |
| F | Email | t.saeed@ais.sch.sa | |
| G | Phone | | empty allowed |
| H | Order | 2 | sort order within campus |

`data-hydrate="contacts.{campus}"` card list.

## Tab: Services

| Column | Header | Example | Notes |
|---|---|---|---|
| A | Department_EN | Finance | fixed set; matches section 6 cards |
| B | Department_AR | الشؤون المالية | |
| C | Channel_EN | finance@ais.sch.sa · ext. 120 | free text |
| D | Channel_AR | | |
| E | Hours_EN | Sun–Thu 7:30–14:00 | |
| F | Hours_AR | | |

`data-hydrate="service.{department}"` per card (channel and hours fields only; descriptions stay static).

## Tab: Announcement

Single data row (row 2). Only one announcement at a time.

| Column | Header | Example | Notes |
|---|---|---|---|
| A | Show | No | `Yes` shows the banner |
| B | Text_EN | School closed Sunday for national holiday | one line, no formatting |
| C | Text_AR | | |
| D | Link | | optional URL |
| E | Expires | 2026-09-01 | banner auto-hides after this date even if Show=Yes |

`data-hydrate="announcement"` banner; dismissal is per-page-load (JS variable, no storage).

## Hydration behavior (implementation contract)

1. Page renders fully from static fallbacks immediately.
2. JS fetches all five published CSVs in parallel, 10s timeout each. Google's published-CSV endpoint measures 1.2s to 4.5s in practice, so a shorter budget drops hydration on mobile.
3. On success, parse (handle quoted commas), replace matching `data-hydrate` content, respecting the current language and campus toggles.
4. On any failure: silent, fallbacks stand, no error UI.
5. Language or campus toggle re-renders hydrated content from the cached parse, no refetch.
6. Latin digits inside any `_AR` value are converted to Arabic-Indic on render, so `الأحد–الخميس 7:30–14:00` displays as `الأحد–الخميس ٧:٣٠–١٤:٠٠` and bidi cannot reverse the range. Emails and URLs are left alone. Editors do not need to think about this.
