// Entry point that imports and starts the actual server from the monorepo structure
// This exists because package.json expects server/index.ts but code was moved to apps/api-gateway/

import "../apps/api-gateway/index.js";