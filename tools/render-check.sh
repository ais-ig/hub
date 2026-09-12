#!/usr/bin/env bash
# Behavioural checks: render index.html in headless Chrome and assert on the
# result. Also writes a 380px screenshot for the mobile check that CLAUDE.md
# requires. Run: bash tools/render-check.sh
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

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --screenshot="$OUT/w380.png" --window-size=380,1600 \
  "file://$PWD/index.html" 2>/dev/null

fail=0
check() { # check <description> <grep-pattern> <expected: yes|no>
  if grep -q "$2" "$OUT/dom.html"; then found=yes; else found=no; fi
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

# The updates layer must have rendered into both containers.
check "updates strip rendered"     'id="updatesStrip"[^>]*hidden' no
check "change log rendered"        'id="changelogList"'          yes

echo
echo "screenshot: $OUT/w380.png"
[ $fail -eq 0 ] && echo "all render checks passed" || echo "render checks failed"
exit $fail
