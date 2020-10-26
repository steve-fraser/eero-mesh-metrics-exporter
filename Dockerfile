# The image is built on top of one that has node preinstalled
FROM node:12-alpine
# Create app directory

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY EeroMetricsWebApplication/package*.json ./

RUN npm install
# If you are building your code for production 

COPY EeroMetricsWebApplication/package*.json ./

COPY EeroMetricsWebApplication/ .

EXPOSE 3000
CMD [ "npm", "start" ]
