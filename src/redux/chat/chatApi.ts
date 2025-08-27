/*import { getSessionToken } from "@/lib/utils";*/
import { baseApi } from "../baseApi";
import { setRoomId, setOpen } from "../roomreducer";
import { create } from "domain";
import Cookies from "js-cookie";

const followApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    

    getRoom: build.query({
      query: () => {
        const token = Cookies.get("access_token");
        return {
          url: `/chat/all-room/`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
      },
      providesTags: [],
    }),
    postCreateRoom: build.mutation({
        query: (body) => {
          const token = getSessionToken();
          return {
            url: `/chat/create-room/`,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body,
          };
        },
        invalidatesTags: [],
        async onQueryStarted(body, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            // Gelen veriyle state güncelleme
            dispatch(setRoomId(data)); // Gelen veriye göre düzenleyin
            // dispatch(setOpen(true));
            console.log(data.id);
          } catch (error) {
            console.error("Error updating state:", error);
          }
        },
      }),
   
  }),
  overrideExisting: false,
});

export const {

  useGetRoomQuery,
  usePostCreateRoomMutation,
 
} = followApi;
