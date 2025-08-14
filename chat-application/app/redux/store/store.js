import { configureStore } from '@reduxjs/toolkit'
import authSliceReducer from  "../features/auth"

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    
  },
})