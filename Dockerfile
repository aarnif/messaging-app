FROM node:alpine AS backend-build

WORKDIR /usr/src/app

COPY /backend/package*.json ./
RUN npm install

COPY /backend .

RUN npm run typecheck


FROM node:alpine AS frontend-build

WORKDIR /usr/src/app

COPY /frontend/package*.json ./
RUN npm install

COPY /frontend .

RUN npm run build


FROM node:alpine
WORKDIR /usr/src/app

COPY --from=backend-build /usr/src/app/package*.json ./
COPY --from=backend-build /usr/src/app/build ./build
COPY --from=backend-build /usr/src/app/src/schema.graphql ./build/src/schema.graphql
COPY --from=frontend-build /usr/src/app/dist ./build/dist

RUN npm ci && \
    npm cache clean --force

EXPOSE 4000
CMD ["node", "build/src/index.js"]