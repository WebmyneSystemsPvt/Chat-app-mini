import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './rootReducer';
import { thunk } from './middleware';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['profile', 'user'],
  blacklist: ["socket"],
  transforms: [{
    in: (state, key) => {
      if (key === 'user' && state && state.user && state.socket) {
        return {
          ...state,
          user: { ...state.user, socket: null }
        };
      }
      return state;
    },
    out: (state) => state
  }]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export const persistor = persistStore(store);
export default store;