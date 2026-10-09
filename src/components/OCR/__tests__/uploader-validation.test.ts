// Tests for src/components/OCR/lib/uploadValidation.ts and the scheduling
// contract of src/components/OCR/Uploader.tsx.
//
// The component itself cannot be rendered here (no DOM / Chakra test harness
// in this repo), so the guard, cleanup, and validation wiring are locked
// through a faithful mirror of its handleUpload flow that calls the real
// validateUpload. Run with: npx -y tsx@4 --test <this file>

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ACCEPTED_TYPES, MAX_FILE_BYTES, validateUpload } from '../lib/uploadValidation'

const TINY_PNG = { type: 'image/png', size: 1024 }

// --- validateUpload boundaries -------------------------------------------------

test('accepts every accepted type', () => {
  for (const type of ACCEPTED_TYPES) {
    assert.deepEqual(validateUpload({ type, size: 1024 }), { ok: true })
  }
})

test('accepts a file at exactly MAX_FILE_BYTES', () => {
  assert.deepEqual(validateUpload({ type: 'image/png', size: MAX_FILE_BYTES }), { ok: true })
})

test('rejects a file one byte over MAX_FILE_BYTES as too_large', () => {
  assert.deepEqual(validateUpload({ type: 'image/png', size: MAX_FILE_BYTES + 1 }), {
    ok: false,
    reason: 'too_large',
  })
})

test('rejects video/mp4 as bad_type', () => {
  assert.deepEqual(validateUpload({ type: 'video/mp4', size: 1024 }), {
    ok: false,
    reason: 'bad_type',
  })
})

test('rejects a missing (empty) type as bad_type', () => {
  assert.deepEqual(validateUpload({ type: '', size: 1024 }), { ok: false, reason: 'bad_type' })
})

test('checks type before size', () => {
  // A file that is both unsupported and oversized reports the type problem
  assert.deepEqual(validateUpload({ type: 'video/mp4', size: MAX_FILE_BYTES + 1 }), {
    ok: false,
    reason: 'bad_type',
  })
})

// --- duplicate guard / cleanup (mirror of Uploader.tsx handleUpload) -----------

function createUploaderHarness(file: { type: string; size: number } | null, delayMs: number) {
  let processing = false
  let pendingTimer: ReturnType<typeof setTimeout> | null = null
  let scheduledCount = 0
  const toasts: string[] = []

  const handleUpload = () => {
    if (processing) return // re-entrant guard (isProcessingRef in the component)
    if (!file) {
      toasts.push('No file selected')
      return
    }
    const validation = validateUpload(file)
    if (!validation.ok) {
      toasts.push(`Invalid file (${validation.reason})`)
      return
    }
    processing = true
    toasts.push('OCR Processing')
    scheduledCount += 1 // stand-in for the 3000ms complete-toast timer
    pendingTimer = setTimeout(() => {
      processing = false
      pendingTimer = null
      toasts.push('OCR Complete')
    }, delayMs)
  }

  // Mirror of the component's useEffect cleanup
  const unmount = () => {
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer)
    }
  }

  return { handleUpload, unmount, toasts, getScheduledCount: () => scheduledCount }
}

test('duplicate guard: two rapid uploads schedule exactly one complete timer', async () => {
  for (const delayMs of [0, 5, 30, 100]) {
    const harness = createUploaderHarness(TINY_PNG, delayMs)
    harness.handleUpload()
    harness.handleUpload() // double-click while processing
    assert.equal(harness.getScheduledCount(), 1, `delay ${delayMs}ms`)
    // let the scheduled timer fire before asserting the full toast sequence
    await new Promise((resolve) => setTimeout(resolve, delayMs + 50))
    assert.deepEqual(harness.toasts, ['OCR Processing', 'OCR Complete'], `delay ${delayMs}ms`)
  }
})

test('invalid file schedules nothing and shows only the Invalid file toast', () => {
  const harness = createUploaderHarness({ type: 'video/mp4', size: 100 }, 30)
  harness.handleUpload()
  assert.equal(harness.getScheduledCount(), 0)
  assert.deepEqual(harness.toasts, ['Invalid file (bad_type)'])
})

test('oversized file schedules nothing and shows only the Invalid file toast', () => {
  const harness = createUploaderHarness({ type: 'image/png', size: MAX_FILE_BYTES + 1 }, 30)
  harness.handleUpload()
  assert.equal(harness.getScheduledCount(), 0)
  assert.deepEqual(harness.toasts, ['Invalid file (too_large)'])
})

test('cleanup cancels a pending complete toast on unmount', async () => {
  const harness = createUploaderHarness(TINY_PNG, 50)
  harness.handleUpload()
  harness.unmount() // component unmounts before the timer fires
  await new Promise((resolve) => setTimeout(resolve, 120))
  assert.deepEqual(harness.toasts, ['OCR Processing'])
})
