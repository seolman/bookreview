FROM node:24-alpine

RUN apk update && apk add --no-cache postgresql-client bash

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN chmod +x ./scripts/entrypoint.sh

ARG USER_UID=10001
ARG GROUP_UID=10001
RUN addgroup -g ${GROUP_UID} -S appgroup && \
    adduser -u ${USER_UID} -S appuser -G appgroup
USER appuser

RUN mkdir /app/logs && chown -R appuser:appgroup /app/logs

EXPOSE 8080

ENTRYPOINT [ "./scripts/entrypoint.sh" ]
CMD [ "node", "dist/src/index.js" ]
