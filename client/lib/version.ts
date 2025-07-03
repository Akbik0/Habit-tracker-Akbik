// App version and build information
export const APP_VERSION = "2.1.0";
export const BUILD_DATE = "2024-12-28";
export const LAST_UPDATED = new Date("2024-12-28T15:30:00Z").toLocaleString();

export const getAppInfo = () => ({
  version: APP_VERSION,
  buildDate: BUILD_DATE,
  lastUpdated: LAST_UPDATED,
});
