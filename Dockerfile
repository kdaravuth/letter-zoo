FROM node:22-alpine
WORKDIR /app
COPY server.js package.json ./
COPY public ./public
ENV NODE_ENV=production PORT=80
EXPOSE 80
CMD ["node", "server.js"]
