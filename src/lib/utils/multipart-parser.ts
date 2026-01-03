/**
 * Multipart Parser Utility
 *
 * Parses multipart/form-data manually when the native FormData parser fails.
 * This is a targeted solution for Next.js 15 standalone mode issues.
 */

export interface ParsedFile {
  name: string;
  filename: string;
  contentType: string;
  data: Uint8Array;
}

export interface ParsedFormData {
  files: Map<string, ParsedFile>;
  fields: Map<string, string>;
}

/**
 * Extracts the boundary string from the Content-Type header
 */
function extractBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  return match ? match[1] || match[2] : null;
}

/**
 * Finds the index of a byte sequence in a Uint8Array
 */
function findSequence(data: Uint8Array, sequence: Uint8Array, start = 0): number {
  outer: for (let i = start; i <= data.length - sequence.length; i++) {
    for (let j = 0; j < sequence.length; j++) {
      if (data[i + j] !== sequence[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/**
 * Converts a Uint8Array slice to a string (ASCII/UTF-8)
 */
function bytesToString(data: Uint8Array, start: number, end: number): string {
  return new TextDecoder().decode(data.slice(start, end));
}

/**
 * Parses headers from a multipart part
 */
function parsePartHeaders(headerSection: string): {
  name: string | null;
  filename: string | null;
  contentType: string;
} {
  const headers = headerSection.split('\r\n');
  let name: string | null = null;
  let filename: string | null = null;
  let contentType = 'application/octet-stream';

  for (const header of headers) {
    const lowerHeader = header.toLowerCase();

    if (lowerHeader.startsWith('content-disposition:')) {
      const nameMatch = header.match(/name="([^"]+)"/);
      const filenameMatch = header.match(/filename="([^"]+)"/);
      name = nameMatch ? nameMatch[1] : null;
      filename = filenameMatch ? filenameMatch[1] : null;
    } else if (lowerHeader.startsWith('content-type:')) {
      contentType = header.substring('content-type:'.length).trim();
    }
  }

  return { name, filename, contentType };
}

/**
 * Parses multipart/form-data from raw bytes
 *
 * @param buffer - The raw request body as ArrayBuffer
 * @param contentType - The Content-Type header value
 * @returns Parsed form data with files and fields
 */
export function parseMultipartFormData(buffer: ArrayBuffer, contentType: string): ParsedFormData {
  const result: ParsedFormData = {
    files: new Map(),
    fields: new Map(),
  };

  const boundary = extractBoundary(contentType);
  if (!boundary) {
    throw new Error('No boundary found in Content-Type header');
  }

  const data = new Uint8Array(buffer);
  const boundaryBytes = new TextEncoder().encode('--' + boundary);
  const crlfCrlf = new TextEncoder().encode('\r\n\r\n');

  // Debug logging
  console.error('[MultipartParser] Parsing:', {
    bufferSize: buffer.byteLength,
    boundary: boundary.substring(0, 50),
    boundaryBytesLength: boundaryBytes.length,
    firstBytes: bytesToString(data, 0, Math.min(200, data.length)),
  });

  let position = 0;

  // Find first boundary
  position = findSequence(data, boundaryBytes, position);
  if (position === -1) {
    console.error('[MultipartParser] Boundary not found in body');
    throw new Error('No boundary found in body');
  }
  console.error('[MultipartParser] First boundary at position:', position);

  while (true) {
    // Move past the boundary
    position += boundaryBytes.length;

    // Check for terminating boundary (--)
    if (data[position] === 45 && data[position + 1] === 45) {
      // 45 is '-'
      break; // End of multipart data
    }

    // Skip CRLF after boundary
    if (data[position] === 13 && data[position + 1] === 10) {
      position += 2;
    }

    // Find the header/body separator (CRLF CRLF)
    const headerEnd = findSequence(data, crlfCrlf, position);
    if (headerEnd === -1) {
      break; // Malformed
    }

    // Extract and parse headers
    const headerSection = bytesToString(data, position, headerEnd);
    const { name, filename, contentType: partContentType } = parsePartHeaders(headerSection);

    // Debug: log each part found
    console.error('[MultipartParser] Part found:', {
      name,
      filename,
      contentType: partContentType,
      headerSection: headerSection.substring(0, 150),
    });

    // Move to body start
    const bodyStart = headerEnd + 4; // Skip \r\n\r\n

    // Find next boundary
    const nextBoundary = findSequence(data, boundaryBytes, bodyStart);
    if (nextBoundary === -1) {
      break; // Malformed or end
    }

    // Body ends before the CRLF preceding the boundary
    const bodyEnd = nextBoundary - 2; // Skip \r\n before boundary

    if (name) {
      if (filename) {
        // It's a file
        const fileData = data.slice(bodyStart, bodyEnd);
        result.files.set(name, {
          name,
          filename,
          contentType: partContentType,
          data: fileData,
        });
      } else {
        // It's a field
        const fieldValue = bytesToString(data, bodyStart, bodyEnd);
        result.fields.set(name, fieldValue);
      }
    }

    position = nextBoundary;
  }

  return result;
}

/**
 * Creates a Blob from a parsed file
 */
export function createBlobFromParsedFile(file: ParsedFile): Blob {
  // Convert Uint8Array to ArrayBuffer to ensure compatibility
  const buffer = file.data.buffer.slice(
    file.data.byteOffset,
    file.data.byteOffset + file.data.byteLength
  ) as ArrayBuffer;
  return new Blob([buffer], { type: file.contentType });
}
