import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  roomId: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    resetRoom: (state) => {
      state.isOpen = false;
      state.roomId = null;
    }
  }
});

// Actions'ları ve reducer'ı export ediyoruz
export const { setOpen, setRoomId, resetRoom } = roomSlice.actions;
export default roomSlice.reducer;