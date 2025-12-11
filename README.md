# 도서 리뷰 서비스 백엔드

[English](/README.en.md)

## 프로젝트에 대하여

이 프로젝트는 만화를 리뷰하고 그에 대해 의견을 나누는 서비스이다.

- 기능
  - 회원가입/로그인
  - 만화, 리뷰, 댓글 CRUD
  - 즐겨찾기
  - 통계 조회

- 기술 스택
  - 타입스크립트
  - Node.js
  - Express.js
  - Drizzle-orm
  - zod

## 설치

`Node v24.8.0`

- 서비스 환경

```bash
npm i
npm run db:migrate
npm run build && npm run start
```

- 테스트, 개발 용도

```bash
npm i
npm run db:migrate && npm run db:seed
npm run build && npm run start
```

```bash
npm run db:reset && npm run db:seed # 기본적인 개발환경으로 초기화
```

## 환경변수

`.env.example`

```shell
# Optional
# NODE_ENV= # [development, production, test]
# PORT= #8080

# Required
DATABASE_URL= #<protocol>://<username>:<password>@<address>:<port>/<database>
JWT_SECRET= # openssl rand -base64 32
ALLOWED_ORIGINS= #http://localhost:3000,...
```

`PORT`: 서비스의 포트번호
`NODE_ENV`: 플랫폼 환경
`DATABASE_URL`: 데이터베이스 주소
`JWT_SECRET`: Json Web Token의 비밀
`ALLOWED_ORIGINS`: CORS를 위한 허용 오리진

## 배포

### 도커

```bash
docker network create manga-app-network
```

```bash
docker run -d \
  --name manga-db \
  --network manga-app-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=manga_db \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-trixie
```

```bash
docker build -t your-username/manga-app:latest .
```

```bash
docker run -d \
  --name manga-app \
  --network manga-app-network \
  -e PORT=8080 \
  -e DB_HOST=manga-db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=manga_db \
  -e DATABASE_URL="postgresql://postgres:postgres@manga-db:5432/manga_db" \
  -e JWT_SECRET=your_super_secret_jwt_key_that_is_very_long \
  -e NODE_ENV=production \
  -p 8080:8080 \
  your-username/manga-app:latest
```

## 인증 흐름

### 전체 인증 흐름도

Client (사용자) <-> Server (백엔드)

1. 로그인: email, password 전송 -> 서버는 Access Token과 Refresh Token 발급
2. API 요청: Access Token을 Authorization 헤더에 담아 요청 -> authMiddleware가 토큰 검증
3. 토큰 만료: Access Token이 만료되면 401 Unauthorized 에러 발생
4. 토큰 재발급: Refresh Token을 서버에 보내 새로운 Access Token 요청
5. 로그아웃: 서버에 로그아웃 요청 -> 서버는 Refresh Token을 무효화

### 단계별 상세 설명

#### 1단계: 사용자 로그인 및 토큰 발급

1. 클라이언트: 사용자가 이메일과 비밀번호를 입력하면, 클라이언트는 이 정보를 담아 POST /v1/api/auth/login으로 요청을 보냅니다.

2. 서버 (`authController` -> `authService`):
   - authService.loginUser 함수가 실행됩니다.
   - 데이터베이스(users 테이블)에서 해당 이메일의 사용자를 찾습니다.
   - 사용자가 없거나 비밀번호가 일치하지 않으면 401 Unauthorized 오류를 반환합니다.
   - 인증에 성공하면, 2개의 JWT를 생성합니다.
     - Access Token (액세스 토큰):
       - 수명이 짧습니다 (현재 코드에서는 15분).
       - 사용자 정보(id, email, role)가 들어있습니다.
       - API 요청 시마다 사용자의 신원을 증명하는 데 사용됩니다.
     - Refresh Token (리프레시 토큰):
       - 수명이 깁니다 (현재 코드에서는 7일).
       - 새로운 액세스 토큰을 발급받기 위한 용도로만 사용됩니다.
   - 생성된 Refresh Token은 데이터베이스의 refresh_tokens 테이블에 저장하여, 나중에 로그아웃 시 무효화할 수 있도록 관리합니다.
   - 서버는 accessToken과 refreshToken을 모두 클라이언트에게 응답으로 전달합니다.

#### 2단계: 보호된 API 접근

1. 클라이언트: GET /v1/api/users/me와 같이 인증이 필요한 API를 호출할 때, HTTP 요청의 Authorization 헤더에 액세스 토큰을 Bearer
   형식으로 담아 보냅니다.
   - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. 서버 (`authMiddleware`):
   - API 라우터에 연결된 authMiddleware가 요청을 가장 먼저 가로챕니다.
   - 헤더의 토큰을 추출하여 jwt.verify() 함수와 JWT_SECRET 키로 유효성을 검증합니다.
   - 토큰이 만료되었거나 위조되었다면, 401 Unauthorized 오류를 반환합니다.
   - 토큰이 유효하면, 토큰 내부의 사용자 ID를 사용하여 데이터베이스에서 사용자 정보를 조회하고, req.user 객체에 담아 다음 핸들러로
     전달합니다.

#### 3단계: 액세스 토큰 만료 및 재발급

1. 클라이언트: API 요청 시 서버로부터 401 Unauthorized 응답을 받으면, 액세스 토큰이 만료되었다고 판단합니다.

2. 클라이언트: 이전에 받아두었던 Refresh Token을 담아 POST /v1/api/auth/refresh로 새로운 액세스 토큰을 요청합니다.

3. 서버 (`authController` -> `authService`):
   - authService.refreshAccessToken 함수가 실행됩니다.
   - 전달받은 Refresh Token의 유효성을 검증하고, 데이터베이스(refresh_tokens 테이블)에 저장된 토큰과 일치하는지 확인합니다.
   - 만약 DB에 해당 토큰이 없다면(예: 다른 곳에서 로그아웃하여 이미 삭제된 경우), 유효하지 않은 토큰으로 간주하고 401 Unauthorized
     오류를 반환합니다.
   - 모든 것이 유효하다면, 새로운 Access Token만 생성하여 클라이언트에게 응답으로 전달합니다. (이때 Refresh Token Rotation 전략을
     사용하면 보안을 더 높일 수 있습니다.)

4. 클라이언트: 새로 발급받은 Access Token으로 이전에 실패했던 API 요청을 다시 시도합니다.

#### 4단계: 사용자 로그아웃

1. 클라이언트: POST /v1/api/auth/logout API를 호출합니다. 이 요청 또한 유효한 액세스 토큰이 필요합니다.

2. 서버 (`authController` -> `authService`):
   - authMiddleware가 사용자를 인증합니다.
   - authService.logoutUser 함수가 실행됩니다.
   - 해당 사용자의 ID를 기준으로 refresh_tokens 테이블에 저장되어 있던 모든 Refresh Token을 삭제합니다.
   - 이제 클라이언트가 가지고 있는 Refresh Token은 서버에서 무효화되었으므로, 더 이상 새로운 Access Token을 발급받을 수 없게 되어
     세션이 효과적으로 종료됩니다.

## RBAC

<!-- TODO -->

user

admin

## 테스크 계정

user 계정

```
user@example.com
password123
```

admin 계정

```
admin@example.com
password123
```

## 데이터베이스 연결

POSTGRESQL 16

<!-- TODO -->

## 엔드포인트

baseurl: `http://localhost:8080/v1/api`
swagger: `http://localhost:8080/docs`

- auth(3)
  post /auth/login
  post /auth/logout
  post /auth/refresh

- users(7)
  post /users
  get /users/me
  put /users/me
  get /users (admin)
  get /users/:id (admin)
  delete /users/me
  patch /users/:id/role (admin)

- mangas(5)
  post /mangas (admin)
  get /mangas
  get /mangas/:id
  put /mangas/:id (admin)
  delete /mangas/:id (admin)

- reviews(6)
  post /mangas/:id/reviews
  get /mangas/:id/reviews
  get /reviews/:id
  put /reviews/:id
  delete /reviews/:id
  get /users/:id/reviews

- comments(4)
  post /reviews/:id/comments
  get /reviews/:id/comments
  put /comments/:id
  delete /comments/:id

- favorites(3)
  post /mangas/:id/favorites
  get /mangas/:id/favorites
  get /users/:id/favorites

- stats(3)
  get /stats/top-reviews
  get /stats/top-rated-mangas
  get /health

## 성능/보안 고려사항

<!-- TODO -->

rate limit
password hashing
jwt
access refresh
env
cors

## 한계와 개선점

<!-- TODO -->

비즈니스 모델의 부족, 결제 시스템의 부재

확장성
캐싱
로깅 모니터링
지속적 배포
