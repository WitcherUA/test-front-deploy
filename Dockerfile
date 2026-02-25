# Frontend build
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install -g npm@latest \ 
&& npm config set registry https://registry.npmjs.org/ \ 
&& npm cache clean --force \ 
&& npm install
COPY frontend .
RUN npm run build

# Backend build
FROM node:18-alpine AS backend-build
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install
COPY backend .
CMD ["npm", "start"]

# Final image for frontend
FROM nginx:alpine AS frontend
COPY --from=frontend-build /frontend/build /usr/share/nginx/html
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

# Final image for backend
FROM backend-build AS backend
EXPOSE 5000
