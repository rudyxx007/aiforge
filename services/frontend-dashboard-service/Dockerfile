# --- Stage 1: Build the React App ---
# This stage builds the static HTML, CSS, and JS files from your React code.
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files for the client
# We copy these first to take advantage of Docker caching.
COPY client/package.json client/package-lock.json ./client/

# Install the React app's dependencies
RUN cd client && npm install

# Copy the rest of the React app's source code
COPY client/ ./client/

# Run the 'npm run build' command to create the optimized production build
RUN cd client && npm run build

# --- Stage 2: Build the Node.js Server (Final Image) ---
# This stage takes the built React files and pairs them with the Node.js proxy server.
FROM node:20-slim

# --- FIX: PATCH BASE IMAGE VULNERABILITIES (Solution 1) ---
# Run apt-get update and upgrade to patch OS-level CVEs like the zlib1g one.
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
# --- END FIX ---

# Set the working directory for the server
WORKDIR /app

# Copy the Node.js server's package.json and package-lock.json
COPY package.json package-lock.json ./
# Install only the production dependencies for the server
RUN npm install --omit=dev

# Copy the built React app (HTML, CSS, JS) from the 'builder' stage (Stage 1)
# This copies the files from '/app/client/build' in the first container
# into the '/app/build' directory in this final container.
COPY --from=builder /app/client/build ./build

# Copy the Node.js proxy server script
COPY server.js .

# Expose the port the Node.js server will run on
EXPOSE 5000

# The command to start the Node.js server
CMD ["node", "server.js"]