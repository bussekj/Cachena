FROM docker.io/library/node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first (to cache this layer and speed up future builds)
COPY package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port your backend runs on and start the server
EXPOSE 5000
CMD ["npm", "start"]