## Stage 1: build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package manifests and install dependencies.  A lock file is not
# included for simplicity; npm will generate one during install.
COPY package.json .
RUN npm install --production=false

# Copy the rest of the source code and build the static site.  The
# build output will be written to the 'dist' directory when using
# Vite.
COPY . .
RUN npm run build

## Stage 2: serve the compiled assets with Nginx
FROM nginx:1-alpine AS serve
WORKDIR /usr/share/nginx/html

# Copy the build output from the previous stage to the Nginx web root.
COPY --from=build /app/dist .

# Expose port 80 and start Nginx.  The default config is sufficient for
# serving a single‑page app.  If routing is required, a custom
# configuration could be copied here.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]