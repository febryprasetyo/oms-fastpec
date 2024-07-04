/**
 * An array of routes that used for authentication
 * These route will be redirected to /settings if the user is already authenticated
 * @type {string[]}
 */

export const authRoutes = ["/login"];

/**
 * The prefix for the api authentication routes
 * Routes that start with this prefix are used for authentication
 * @type {string}
 */

export const apiAuthPrefix = "/fastpec/api/auth/login";

/**
 * The default login redirect path
 * @type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
