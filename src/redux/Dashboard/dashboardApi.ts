import { baseApi } from "../baseApi";
import Cookies from "js-cookie";

const authApi = baseApi.injectEndpoints({

  
  endpoints: (build) => ({
    dashboardStats: build.query({
        query: ( {id} ) => {
          return {
            url: `/user/dashboard-stats/${id}/`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          };
        },
        providesTags: [],
      }),
  }),
  overrideExisting: false,
});

export const {  useDashboardStatsQuery} = authApi;
