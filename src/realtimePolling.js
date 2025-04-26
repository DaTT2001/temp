import store from './store'
import { formatTemperatureData, API_BASE_URL } from './api'

const POLLING_INTERVAL = 10000
let intervals = []

export function startPolling() {
  if (store.getState().isPolling) return stopPolling

  const tables = ['t4', 't5', 'g1', 'g2', 'g3']

  const fetchLatestData = async (table) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${table}/latest`)
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
      const { data: latestRecord } = await response.json()

      if (latestRecord) {
        const formattedData = formatTemperatureData(latestRecord)
        const currentData = store.getState().latestData[table]
        if (JSON.stringify(currentData) !== JSON.stringify(formattedData)) {
          store.dispatch({
            type: 'setLatestData',
            latestData: { [table]: formattedData },
          })
        }
      }
    } catch (error) {
      console.error(`Error fetching ${table}:`, error.message)
    }
  }

  tables.forEach(table => fetchLatestData(table))
  intervals = tables.map(table =>
    setInterval(() => fetchLatestData(table), POLLING_INTERVAL)
  )

  store.dispatch({ type: 'setPolling', isPolling: true })

  return stopPolling
}

export function stopPolling() {
  intervals.forEach(interval => clearInterval(interval))
  intervals = []
  store.dispatch({ type: 'setPolling', isPolling: false })
}