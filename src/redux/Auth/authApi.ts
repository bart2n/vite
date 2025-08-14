import { baseApi } from "../baseApi";
import Cookies from "js-cookie";

const authApi = baseApi.injectEndpoints({

  
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({
        url: "token/",
        method: "POST",
        body,
      }),
    }),
    getUserInstitutions: build.query({
      query: () => {
        const token = Cookies.get("access_token");
        return {
          url: "user/get-institution/",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
      },
      providesTags: [],
    }),
    register: build.mutation({
      query: (body) => ({
        url: "rest-auth/registration/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useGetUserInstitutionsQuery  } = authApi;
