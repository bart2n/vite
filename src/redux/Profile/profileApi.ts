import { baseApi } from "../baseApi";
import Cookies from "js-cookie";

const authApi = baseApi.injectEndpoints({

  
  endpoints: (build) => ({
    getInstitutionTimeline: build.query({
      query: ({id}) => {
        const token = Cookies.get("access_token");
        return {
          url: `user/timeline/get-timeline/?institution_id=${id}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
      },
      providesTags: [],
    }),
  }),
  overrideExisting: false,
});

export const {  useGetInstitutionTimelineQuery  } = authApi;
