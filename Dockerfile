# Retold Content System — long-running service.
# Port 7780 by default; serves a Pict-based content management UI +
# REST API.
#
# `npm install` (not `npm ci`) is intentional — package-lock.json is
# gitignored per the Quackage convention. See BUILDING-AND-PUBLISHING.md.

# Stage 1: Build the bundled web application
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY .quackage.json ./
COPY source/ source/
COPY web-application/ web-application/
COPY html/ html/
COPY css/ css/
COPY content/ content/
COPY build/ build/
# `quack build` compiles the Pict bundle; `quack copy` stages it into
# the served paths.
RUN npx quack build && npx quack copy

# Stage 2: Runtime — production deps only, build artifacts copied over
FROM node:22-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=builder /app/source/          source/
COPY --from=builder /app/web-application/ web-application/
COPY --from=builder /app/html/            html/
COPY --from=builder /app/css/             css/
COPY --from=builder /app/content/         content/

RUN mkdir -p /app/data
EXPOSE 7780
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD node -e "const h=require('http');h.get('http://localhost:7780/',(r)=>{process.exit(r.statusCode<500?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "source/cli/ContentSystem-CLI-Run.js", "serve"]
