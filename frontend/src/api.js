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
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Server error ${response.status}: ${errText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter((l) => l.startsWith('data:'))

      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(5).trim())
          if (json.status === 'running') {
            onStatus?.(json.message)
          } else if (json.status === 'complete') {
            onResult?.(json.result)
          } else if (json.status === 'error') {
            onError?.(json.message)
          }
        } catch (_) {
          /* skip malformed lines */
        }
      }
    }
  } catch (err) {
    onError?.(err.message || 'Unknown error')
  }
}
