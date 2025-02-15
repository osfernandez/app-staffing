
FROM node:14 AS builder

WORKDIR /usr/src/app

RUN NODE_ENV="production"

COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm run storybook:build


FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /usr/src/app/build .
 
COPY --from=builder /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]



FROM node:14 as development
# Create app directory
WORKDIR /usr/src/app

# install kubectl
ARG KUBECTL_VERSION=1.21.3
ADD https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl

# get files && install dependencies
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY . .



# expose your ports
EXPOSE 3000

# start it up
CMD [ "npm", "run", "dev" ]