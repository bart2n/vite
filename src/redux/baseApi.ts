import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiPath = "http://127.0.0.1:8000/api/";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiPath,
    prepareHeaders: (headers) => {
      // token'ı storage'dan ekle (store'a bağımlılık kurmamak için)
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Auth", // örnek
  ],
  endpoints: () => ({}),
});
