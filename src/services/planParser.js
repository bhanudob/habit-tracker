const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

function getApiKey() {
  return localStorage.getItem('ht_anthropic_key') || ''
}

export function hasApiKey() {
  return !!getApiKey()
}

export function saveApiKey(key) {
  localStorage.setItem('ht_anthropic_key', key.trim())
}

export function clearApiKey() {
  localStorage.removeItem('ht_anthropic_key')
}

export async function parsePlan(text, dateStr) {
  const key = getApiKey()
  if (!key) throw new Error('No API key set. Add your Anthropic API key in Settings.')

  const today = dateStr || new Date().toISOString().split('T')[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const systemPrompt = `You extract schedule items from natural language text and return structured JSON.

Rules:
- Times like "5PM", "17:00", "five o'clock" → 24h HH:MM format
- "after that", "then" → continue from previous end time
- "probably by X" / "around X" → use X as endTime
- If a task spans midnight (e.g. sleep starting 11PM), date increments
- "morning", "wake up" → next day if context implies it
- If no end time is stated, estimate a reasonable duration
- Return ONLY a JSON array, no prose

Today is ${today}. Tomorrow is ${tomorrowStr}.

Output format (array of objects):
[
  {
    "title": "Coding",
    "startTime": "17:00",
    "endTime": "19:00",
    "date": "${today}"
  }
]`

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const raw = data.content?.[0]?.text || ''

  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Could not parse response from Claude.')

  return JSON.parse(match[0])
}
