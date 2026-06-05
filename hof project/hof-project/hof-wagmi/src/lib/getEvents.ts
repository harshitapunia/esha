// ── Endpoint ─────────────────────────────────────────────────────────────────
// The slug must match the subgraph name deployed on The Graph Studio.
// Deploy script in chain-link/package.json uses "chain-link" as the slug.
// const GRAPH_ENDPOINT =
//   'https://api.studio.thegraph.com/query/1748401/chain-link/version/latest'
  const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/1748401/chain-link/v0.0.2'

// API key from The Graph Studio → "API Keys" tab (or use your Deploy Key)
const GRAPH_API_KEY = import.meta.env.VITE_GRAPH_API_KEY as string | undefined

// ── Types ─────────────────────────────────────────────────────────────────────
export type GraphEvent = {
  id: string          // eventId (string from subgraph)
  name: string
  description: string
  startTime: string   // Unix seconds as string
  endTime: string     // Unix seconds as string
  location: string
  creator: string     // wallet address (hex)
}

// ── Query ─────────────────────────────────────────────────────────────────────
const EVENTS_QUERY = `
  query GetAllEvents {
    events(first: 100, orderBy: startTime, orderDirection: asc) {
      id
      name
      description
      startTime
      endTime
      location
      creator
    }
  }
`

// ── Fetcher ───────────────────────────────────────────────────────────────────
export async function getEvents(): Promise<GraphEvent[]> {
  let res: Response
  try {
    res = await fetch(GRAPH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(GRAPH_API_KEY ? { 'Authorization': `Bearer ${GRAPH_API_KEY}` } : {}),
      },
      body: JSON.stringify({ query: EVENTS_QUERY }),
    })
  } catch (networkErr) {
    throw new Error(
      `Network error reaching The Graph endpoint:\n${GRAPH_ENDPOINT}\n\n` +
      `${networkErr instanceof Error ? networkErr.message : String(networkErr)}`
    )
  }

  const json = await res.json()

  // Surface GraphQL-level errors clearly
  if (json.errors?.length) {
    const msgs = (json.errors as { message: string }[])
      .map((e) => e.message)
      .join('\n')
    throw new Error(
      `The Graph returned errors for subgraph "${GRAPH_ENDPOINT}":\n\n${msgs}\n\n` +
      `► Make sure the subgraph has been deployed and synced on https://thegraph.com/studio/\n` +
      `► The deploy slug in chain-link/package.json is "chain-link" — verify it matches your Studio dashboard.`
    )
  }

  if (!json.data) {
    throw new Error(
      `Unexpected response from The Graph (no "data" field):\n${JSON.stringify(json, null, 2)}`
    )
  }

  return (json.data.events as GraphEvent[]) ?? []
}
