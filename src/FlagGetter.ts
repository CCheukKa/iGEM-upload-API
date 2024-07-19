/**
 * Determines if the application is running in debug mode by grabbing the value of the NODE_ENV environment variable.
 * @returns {boolean} Returns true if the application is running in debug mode, false otherwise.
 */
export const isDebug = (process.env.NODE_ENV?.trim() === 'debug');