# Use a Node.js image for building
FROM node:14 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Use Nginx to serve the application
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
