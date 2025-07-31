# Survey Export

REST API with NestJS framework

## [csv-generator](https://github.com/HasanNugroho/csv-generator)

## Getting Started

### Requirements

- Node.js (v18+)
- (Optional) Docker & Docker Compose

### Install & Run

Download this project:

```shell script
git clone https://github.com/HasanNugroho/csv-generator.git
```

### Manual Installation

Install dependencies

```shell script
npm install
```

#### Run the App

```shell script
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# running on default port 3000
```

### Run with Docker (Recomended)

```shell script
docker-compose up -d
```

### API Documentation

This project uses **GraphQL** for API documentation. you can access the documentation at: **[http://localhost:3000/graphql](http://localhost:3000/graphql)**

![documentation](/image.png)

## Structures

```
csv-generator
├── docker-compose.yml
├── Dockerfile
├── eslint.config.mjs
├── image.png
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
├── src
|  ├── app.module.ts
|  ├── common
|  |  └── enum.ts
|  ├── data
|  |  └── be-test-mock.json
|  ├── main.ts
|  ├── schema.gql
|  └── survey
|     ├── dto
|     |  └── survey.dto.ts
|     ├── survey.module.ts
|     ├── survey.resolver.ts
|     └── survey.service.ts
├── test
|  ├── app.e2e-spec.ts
|  └── jest-e2e.json
├── tree.txt
├── tsconfig.build.json
└── tsconfig.json
```

## Credits

- **[NestJS](https://nestjs.com/)** - A framework server-side applications.
- **[GraphQL](https://graphql.org/)** - A tool API documentation.

## Copyright

Copyright (c) 2025 Burhan Nurhasan Nugroho.
