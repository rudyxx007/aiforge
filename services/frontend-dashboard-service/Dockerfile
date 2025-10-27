# --- Stage 1: Build the React App ---
FROM node:18-alpine AS builder
# ... (rest of Stage 1 is unchanged) ...
RUN cd client && npm run build

# --- Stage 2: Build the Node.js Server ---
FROM node:18-slim

# --- ADD THIS BLOCK TO PATCH VULNERABILITIES ---
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
# --- END FIX ---

WORKDIR /app

# Copy Node.js server's package.json
COPY package.json package-lock.json ./
# Install server dependencies
RUN npm install --omit=dev

# Copy the built React app from the 'builder' stage
COPY --from=builder /app/client/build ./build

# Copy the server.js file
COPY server.js .

EXPOSE 5000
CMD ["node", "server.js"]