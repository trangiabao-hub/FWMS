import { combineReducers } from "@reduxjs/toolkit";
import { counterSlice } from "./features/couter";
import { userSlice } from "./features/user";

const rootReducer = combineReducers({
  //   user: userReducer,
  counter: counterSlice.reducer,
  user: userSlice.reducer,
});

export default rootReducer;
