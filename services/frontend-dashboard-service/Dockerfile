# --- Stage 1: Build the React App ---
FROM node:18-alpine AS builder

WORKDIR /app
# Copy React app's package.json first
COPY client/package.json client/package-lock.json ./client/

# Install React dependencies
RUN cd client && npm install

# Copy the rest of the React app source code
COPY client/ ./client/

# Build the static React app
RUN cd client && npm run build

# --- Stage 2: Build the Node.js Server ---
FROM node:18-slim

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