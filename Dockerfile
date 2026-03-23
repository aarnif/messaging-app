FROM node:alpine AS backend-build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend

COPY backend ./backend

RUN npm run generate --workspace=backend && \ 
    npm run typecheck --workspace=backend


FROM node:alpine AS frontend-build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN npm ci --workspace=frontend

COPY frontend ./frontend

RUN npm run generate --workspace=frontend && \ 
    npm run build --workspace=frontend


FROM node:alpine
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

COPY --from=backend-build /usr/src/app/backend/build ./build
COPY --from=backend-build /usr/src/app/backend/src/schema.graphql ./build/src/schema.graphql
COPY --from=frontend-build /usr/src/app/frontend/dist ./build/dist

RUN npm ci --omit=dev && \
    npm cache clean --force

EXPOSE 4000
CMD ["node", "build/src/index.js"]