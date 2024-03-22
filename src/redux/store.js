import rootReducer from "./rootReducer";
import storage from "redux-persist/lib/storage"; // or 'redux-persist/lib/storage/session' for sessionStorage
import { persistStore, persistReducer } from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";

const persistConfig = {
  key: "root", // The key for the persisted state in the storage
  storage, // Choose the storage type (e.g., local storage, session storage)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

const persistor = persistStore(store);

export { store, persistor };
