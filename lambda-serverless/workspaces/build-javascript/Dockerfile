FROM node:16-alpine
WORKDIR /app
RUN npm install -g express axios
COPY ./runner.js /app/runner.js
CMD ["node", "/app/runner.js"]