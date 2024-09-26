# Dockerfile

# Stage 1: Build Stage
FROM node:14 as build-stage

# Set the working directory
WORKDIR /app

# Copy frontend and backend directories
COPY frontend ./frontend
COPY backend ./backend

# Install dependencies and build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Stage 2: Production Stage
FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Copy backend and frontend build
COPY --from=build-stage /app/backend /app/backend
COPY --from=build-stage /app/frontend/out /app/frontend/out

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]
