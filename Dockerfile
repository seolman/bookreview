FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:24-alpine

RUN apk update && apk add --no-cache postgresql-client bash

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --from=builder /app/dist ./dist

COPY scripts/entrypoint.sh .
RUN chmod +x entrypoint.sh

ARG USER_UID=10001
ARG GROUP_UID=10001
RUN addgroup -g ${GROUP_UID} -S appgroup && \
    adduser -u ${USER_UID} -S appuser -G appgroup

USER appuser

EXPOSE 8080

ENTRYPOINT [ "./entrypoint.sh" ]
CMD [ "node", "dist/src/index.js" ]
