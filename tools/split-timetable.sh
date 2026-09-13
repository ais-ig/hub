#!/usr/bin/env bash
# Split the combined aSc timetable into one PDF per class, so each class pill
# opens only that class. CLASSES is the page order of the aSc export: if the
# school adds or removes a class, re-derive it before running.
# Run: bash tools/split-timetable.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=assets/class-timetables-boys.pdf
OUT=assets/timetables
CLASSES=(9a 9b 9c 9d 10a 10b 10c 11a 11b 12a 12b)

pages=$(pdfinfo "$SRC" | awk '/^Pages:/ { print $2 }')
if [ "$pages" -ne "${#CLASSES[@]}" ]; then
  echo "FAIL $SRC has $pages pages but CLASSES lists ${#CLASSES[@]}" >&2
  exit 1
fi

mkdir -p "$OUT"
for i in "${!CLASSES[@]}"; do
  pdfseparate -f $((i + 1)) -l $((i + 1)) "$SRC" "$OUT/${CLASSES[$i]}.pdf"
done
echo "split $pages pages into $OUT/"
