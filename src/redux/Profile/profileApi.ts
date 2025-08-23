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
    getInstitutionDetail: build.query({
        query: (institutionId) => {
          return {
            url: `user/get-institution-detail/`,
            headers: {
              "Content-Type": "application/json",
            },
            params: { id: institutionId },
          };
        },
        providesTags: [],
      }),
  }),
  overrideExisting: false,
});

export const {  useGetInstitutionTimelineQuery,useGetInstitutionDetailQuery  } = authApi;
