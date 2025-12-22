// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./Features/cart/slice";

export const store = configureStore({
    reducer: {
        cart: cartReducer,
    },
});

export default store;
