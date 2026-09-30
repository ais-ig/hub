#!/usr/bin/env bash
# Behavioural checks: render index.html in headless Chrome and assert on the
# result. Also drives a true 380px mobile viewport check (tools/shot.mjs)
# rather than a cropped desktop screenshot. Run: bash tools/render-check.sh
set -uo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="${TMPDIR:-/tmp}/hub-check"
mkdir -p "$OUT"

if [ ! -x "$CHROME" ]; then
  echo "FAIL chrome not found at $CHROME"
  exit 1
fi

"$CHROME" --headless=new --disable-gpu --dump-dom --virtual-time-budget=3000 \
  "file://$PWD/index.html" 2>/dev/null > "$OUT/dom.html"

# The same page opened in Arabic, as a parent following a ?lang=ar link.
"$CHROME" --headless=new --disable-gpu --dump-dom --virtual-time-budget=3000 \
  "file://$PWD/index.html?lang=ar" 2>/dev/null > "$OUT/dom-ar.html"

fail=0
DOM="$OUT/dom.html"
check() { # check <description> <grep-pattern> <expected: yes|no>
  if grep -q "$2" "$DOM"; then found=yes; else found=no; fi
  if [ "$found" = "$3" ]; then
    echo "ok   $1"
  else
    echo "FAIL $1 (expected $3, got $found)"
    fail=1
  fi
}

# The countdown must stay hidden while no event is scheduled. new Date(null)
# is 1 Jan 1970, a valid date, so a Date-validity guard is not enough: the
# script must test the attribute strings for presence.
check "countdown is hidden"        'id="cd" hidden'              yes
check "no thank-you message shown" 'Thank you for joining us<'   no

# The updates layer must have rendered. The change log section (and its nav
# link) and the bell start hidden in the markup and are only shown by the
# renderer once at least one entry parses: this guards against Finding 1 (an
# empty titled box with nothing under it). The strip's visibility is not
# asserted: it shows only unread entries inside the 14-day window, so it
# depends on today's date and on the browser's saved read state.
check "updates strip present"        'id="updatesStrip"'          yes
check "bell button not hidden"       'id="bellbtn" hidden'        no
check "bell list rendered"           'class="bitem'               yes
check "change log rendered"          'id="changelogList"'         yes
check "change log section not hidden" 'id="changelog" hidden'     no
check "change log nav not hidden"    'id="changelogNav" hidden'   no

# English is the default and must not pick up the Arabic direction.
check "English page is left to right" '<html lang="en" dir="ltr"'  yes
check "language button not hidden"   'id="langbtn"[^>]* hidden'    no
check "English page marked ready"    '<html[^>]*data-lang-ready="en"' yes

# Arabic: the root element is flipped, the hero title is the Arabic one, and
# applyLang itself lifted the cover that hides the page while the Arabic is
# written. It marks the root data-lang-ready when it does; the class alone
# proves nothing, because the fail-safe timer removes it within this run's
# time budget anyway. The updates must be painted with no English month
# left in a date, whichever months the entries fall in.
DOM="$OUT/dom-ar.html"
check "Arabic page is right to left" '<html lang="ar" dir="rtl"'   yes
check "Arabic hero title"            'data-i18n="hero.title">بوابة أولياء الأمور</h1>' yes
check "Arabic cover lifted by applyLang" '<html[^>]*data-lang-ready="ar"' yes
check "Arabic page is not left hidden" '<html[^>]*i18n-wait'       no
check "Arabic bell list rendered"    'class="bitem'                yes
check "Arabic dates rendered"        'class="dt">[0-9][0-9]* [^<]'  yes
check "no English month in an Arabic date" 'class="dt">[0-9]* [A-Za-z]' no

echo
echo "-- mobile viewport check, English (tools/shot.mjs) --"
node "$(dirname "$0")/shot.mjs"
shot_status=$?
[ $shot_status -ne 0 ] && fail=1

echo
echo "-- mobile viewport check, Arabic (tools/shot.mjs --lang=ar) --"
node "$(dirname "$0")/shot.mjs" --lang=ar
shot_status=$?
[ $shot_status -ne 0 ] && fail=1

echo
[ $fail -eq 0 ] && echo "all render checks passed" || echo "render checks failed"
exit $fail
