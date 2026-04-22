/**
 * Shared API utility — calls FastAPI SSE endpoints and streams results.
 */

const BASE_URL = '/api'

/**
 * Generic SSE fetch helper.
 * @param {string} endpoint
 * @param {object} body
 * @param {function} onStatus  - called with status string
 * @param {function} onResult  - called with the final result object
 * @param {function} onError   - called with error message string
 */
export async function callAgentStream(endpoint, body, { onStatus, onResult, onError }) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server error ${response.status}: ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // The last element is either an empty string (if buffer ends with \n)
      // or a partial line. Keep it for the next chunk.
      buffer = lines.pop();

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

        try {
          const data = JSON.parse(trimmedLine.slice(5).trim());
          if (data.status === 'running') {
            onStatus?.(data.message);
          } else if (data.status === 'complete') {
            onResult?.(data.result);
          } else if (data.status === 'error') {
            onError?.(data.message);
          }
        } catch (e) {
          console.warn('Failed to parse SSE line:', trimmedLine, e);
        }
      }
    }
  } catch (err) {
    onError?.(err.message || 'Unknown error');
  }
}
