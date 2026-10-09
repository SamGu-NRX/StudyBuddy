#!/usr/bin/env bash
# Runs both OCR example scripts with plain node. Exit 0 only if all green.
#
# Usage (from anywhere):
#   bash src/components/OCR/examples/run-all.sh
#
# ocr-engine-demo.mjs needs the repo's node_modules (tesseract.js, sharp) and,
# on first run, outbound internet to download eng.traineddata.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "node $(node --version)"

for script in ocr-engine-demo.mjs crop-scale-math.mjs; do
  echo
  echo "== Running ${script} =="
  node "${SCRIPT_DIR}/${script}"
  echo "PASS: ${script}"
done

echo
echo "ALL GREEN: OCR pipeline examples passed"
