FROM node:latest  AS firststage 
WORKDIR /app
COPY . .
RUN npm -v
RUN npm install
# RUN npm run build

FROM node:alpine AS secondstage
WORKDIR /app
COPY --from=firststage /app/ /app/
# RUN npm install -g serve

EXPOSE 3000
CMD ["npm", "run", "start:production"]