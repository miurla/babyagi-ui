FROM node:19

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV OPENAI_API_KEY=""
ENV PINECONE_API_KEY=""
ENV PINECONE_ENVIRONMENT=""
ENV NEXT_PUBLIC_TABLE_NAME="baby-agi-test-table"
ENV NEXT_PUBLIC_USE_USER_API_KEY="false"
ENV SEARP_API_KEY=""

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]
