import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";


/* RTK-Query apis */
import { baseApi } from "./baseApi";
/*import {authApi} from "./Auth/authApi"*/


export const store = configureStore({
  reducer: {
    /* RTK-Query reducers */
    [baseApi.reducerPath]: baseApi.reducer,
    /*[authApi.reducerPath]: authApi.reducer,

    /* normal slices */
  },
  middleware: (getDefault) =>
    getDefault().concat(
      baseApi.middleware,
    ),
});

setupListeners(store.dispatch);

/* types */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
