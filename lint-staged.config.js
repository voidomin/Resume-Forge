module.exports = {
  "*.{ts,tsx,js,jsx,json,md}": ["prettier --write"],
  "resume-builder/backend/src/**/*.ts": () =>
    "npm --prefix resume-builder/backend run lint",
  "resume-builder/frontend/src/**/*.{ts,tsx}": () =>
    "npm --prefix resume-builder/frontend run lint",
};
