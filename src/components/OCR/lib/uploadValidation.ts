// Client-side upload validation for the OCR uploader. The <input accept>
// attribute only filters the OS file picker; a file can still arrive with an
// unsupported type or over the size limit, so validate before processing.

export const ACCEPTED_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
]

// 10 MB
export const MAX_FILE_BYTES = 10485760

export function validateUpload(
  file: { type: string; size: number },
): { ok: true } | { ok: false; reason: 'bad_type' | 'too_large' } {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, reason: 'bad_type' }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, reason: 'too_large' }
  }
  return { ok: true }
}
