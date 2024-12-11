# To Do List

## Integrantes

- Henrique da Fonseca Diniz Freitas
- Gabriel Alves Reis
- Ivan Vilaça de Assis

## Sobre o To Do List

É uma RESTful _api_ para que usuários possam gerir suas tarefas. Sendo que nele os usuários podem criar sua conta e criar suas tarefas, podendo defini-las como públicas, visíveis a todos os outros usuários da plataforma, e privadas, visíveis apenas para o criador da atividade. Além disso, os usuários podem alterar e deletar tarefas já existentes.

Há também rotas para as operações relacionadas a criação e manipulação dos usuários. Sendo que os usuários aramazenam a sua foto como uma _string_, isso foi feito pensando que a foto seria no formato base64 básico.

## Tecnologias

- Typescript;
- NodeJs;
- Express;
- Prisma studio;
- Jest;

## Para execução do projeto

Será necessário seguir os seguintes passos para configurar e rodar o projeto:
- Clonar o repo;
- Instalar o node e npm na sua máquina;
- Rodar npm install na raiz do projeto;
- Criar o arquivo .env na raiz do projeto como a seguir:
```
PORT=3030
DATABASE_URL='file:./prisma/dev.db'
SECRET_KEY='mySecretKey'
JWT_EXPIRATION='5h'
NODE_ENV='development'
SALT_ROUNDS='10'
```
- Executar npm run dev para rodar o projeto;
- Para rodar os testes bastar rodar npm test.

## Extras:
- Caso queiram ver o estado do banco rodem npx prisma studio;
- A biblioteca de testes que optei foi [Jest](https://jestjs.io/docs/api) porque ela funciona bem com JS e TS;
- Segue a documentação das rotas do projeto no postman: https://documenter.getpostman.com/view/23267969/2sAYHwKQaE.
- Site para converter uma imagem para base64: https://base64.guru/converter/encode/image.