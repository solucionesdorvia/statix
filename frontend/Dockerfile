FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:20-alpine

RUN npm install -g serve@14

WORKDIR /app

COPY --from=build /app/dist ./dist

CMD ["sh", "-c", "exec serve -s dist -l tcp://0.0.0.0:${PORT:-3000}"]
