/**
 * Application configuration constants
 */

export const APP_CONFIG = {
  name: "GoPark",
  version: "1.0.0",
  description: "Parking Management System",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  USER: {
    PROFILE: "/users/profile",
    UPDATE: "/users/update",
  },
  PARKING: {
    LIST: "/parking",
    DETAIL: "/parking/:id",
    BOOK: "/parking/:id/book",
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  THEME: "theme",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
} as const;
