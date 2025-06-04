import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./reducers/dashboardReducer";

const store = configureStore({
    reducer: {
        dashboard: dashboardReducer, // Ensure this is a valid reducer!
    }
});

export default store;
