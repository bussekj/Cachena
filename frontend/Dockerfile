# Stage 1: Build the React application
FROM docker.io/library/node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM docker.io/library/nginx:alpine
# Copy custom Nginx configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built files from the previous stage into Nginx's serving directory
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]