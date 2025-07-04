// App version and build information
export const APP_VERSION = "2.1.2";
export const BUILD_DATE = "2025-07-04";
export const LAST_UPDATED = new Date("2025-07-04T17:03:00Z").toLocaleString(
  "en-US",
  {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
);

export const getAppInfo = () => ({
  version: APP_VERSION,
  buildDate: BUILD_DATE,
  lastUpdated: LAST_UPDATED,
});
