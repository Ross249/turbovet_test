import { authFeature } from './auth.reducer';

export const selectAuth = authFeature.selectAuthState;
export const selectAuthUser = authFeature.selectUser;
export const selectAuthToken = authFeature.selectToken;
export const selectAuthStatus = authFeature.selectStatus;
export const selectAuthError = authFeature.selectError;

export const selectIsAuthenticated = authFeature.selectIsAuthenticated;
