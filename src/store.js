import { legacy_createStore as createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  latestData: {
    t4: null,
    t5: null,
    g1: null,
    g2: null,
    g3: null,
  },
  isPolling: false,
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    case 'setLatestData':
      return {
        ...state,
        latestData: {
          ...state.latestData,
          ...rest.latestData,
        },
      }
    case 'setPolling':
      return { ...state, isPolling: rest.isPolling }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
