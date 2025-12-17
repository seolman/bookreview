# 만화 리뷰 서비스 백엔드

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
npm run build
npm run db:migrate
npm run start
```

- 테스트, 개발 용도

```bash
npm i
npm run build
npm run db:migrate && npm run db:seed
npm run dev
```

```bash
npm run db:reset && npm run db:seed # 기본적인 개발환경으로 초기화
```

## 환경변수

`.env.example`

```env
# Optional
# NODE_ENV= # [development, production, test]
# PORT= # 8080

# Required
DATABASE_URL= #<protocol>://<username>:<password>@<address>:<port>/<database>
JWT_SECRET= # openssl rand -base64 32
ALLOWED_ORIGINS= #http://localhost:3000,...
REDIS_URL=
GOOGLE_CLIENT_ID= # https://console.cloud.google.com/auth
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GITHUB_CLIENT_ID= # https://github.com/settings/developers
GITHUB_CLIENT_SECRET= #
GOOGLE_APPLICATION_CREDENTIALS= # admin-sdk.json
```

`PORT`: 서비스의 포트번호
`NODE_ENV`: 플랫폼 환경
`DATABASE_URL`: 데이터베이스 주소
`JWT_SECRET`: Json Web Token의 비밀
`ALLOWED_ORIGINS`: CORS를 위한 허용 오리진
`GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID (Google Cloud Console에서 발급)
`GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 Secret (Google Cloud Console에서 발급)
`GOOGLE_CALLBACK_URL`: Google OAuth 콜백 URL
`GITHUB_CLIENT_ID`: Github OAuth 클라이언트 ID
`GITHUB_CLIENT_SECRET`: Github OAuth 클라이언트 Secret
`GOOGLE_APPLICATION_CREDENTIALS`: Firebase Admin SDK

## 배포

### 리버스 프록시

`Postgresql 16.11`

```bash
sudo apt install postgresql
sudo -u postgres psql
```

```sql
alter user postgres with password postgres;
create database manga_db;
```

`redis 8.2.2`

```bash
sudo apt-get install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
```

`Nginx/1.24.0`

`/etc/nginx/sites-enabled/manga-app`

```nginx
server {
  listen 80;
  listen [::]:80;

  server_name <public-ip>;

  location / {
    proxy_pass http://localhost:8080;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

```bash
sudo npm i pm2 -g
pm2 start dist/src/index.js --name manga-app
```

```bash
curl http://<public-ip>:<port>/health --silent # | jq "."
```

### 도커

```bash
docker compose up -d
```

`예시 데이터 시딩`

```bash
docker exec <app_name> npm run db:seed
```

### 쿠버네티스

<!-- TODO -->

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

#### 5단계: 소셜 로그인 (Google OAuth & Firebase Auth Github)

1. 클라이언트: 사용자가 Google 소셜 로그인 버튼을 클릭하면, `/auth/google` 엔드포인트로 리다이렉트됩니다.
2. 서버 (`authController` -> `authService`):
   - Google OAuth 인증 흐름을 시작하여 Google 로그인 페이지로 사용자를 리다이렉트합니다.
3. 사용자: Google 로그인 페이지에서 계정을 선택하고 인증을 완료합니다.
4. Google: 인증 성공 후, `GOOGLE_CALLBACK_URL`로 지정된 콜백 URL (`/auth/google/callback`)로 사용자를 리다이렉트합니다. 이때 인증 코드를 함께 전달합니다.
5. 서버 (`authController` -> `authService`):
   - 콜백 URL을 통해 전달받은 인증 코드로 Google, Github API를 호출하여 사용자 정보를 획득합니다.
   - 소셜 로그인 제공자에서 Custom Token을 생성합니다.
   - 생성된 Custom Token으로 Access Token 및 Refresh Token을 클라이언트에게 발급하여 응답합니다. 이후 과정은 일반 로그인과 동일합니다.

## RBAC (역할 기반 접근 제어)

본 서비스는 'user'와 'admin' 두 가지 역할을 지원하며, 각 역할별 API 접근 권한은 다음과 같습니다.

| API Endpoints            | Method         | User    | Admin | 설명                         |
| :----------------------- | :------------- | :------ | :---- | :--------------------------- |
| `/auth/login`            | POST           | O       | O     | 로그인                       |
| `/auth/logout`           | POST           | O       | O     | 로그아웃 (본인)              |
| `/auth/refresh`          | POST           | O       | O     | 토큰 재발급                  |
| `/users`                 | POST           | O       | O     | 회원가입                     |
| `/users/me`              | GET/PUT/DELETE | O       | O     | 내 정보 조회/수정/탈퇴       |
| `/users`                 | GET            | X       | O     | **모든 사용자 목록 조회**    |
| `/users/{id}`            | GET            | X       | O     | **특정 사용자 정보 조회**    |
| `/users/{id}/role`       | PATCH          | X       | O     | **사용자 역할 변경**         |
| `/mangas`                | GET            | O       | O     | 만화 목록 조회               |
| `/mangas/{id}`           | GET            | O       | O     | 특정 만화 정보 조회          |
| `/mangas`                | POST           | X       | O     | **새 만화 추가**             |
| `/mangas/{id}`           | PUT            | X       | O     | **만화 정보 수정**           |
| `/mangas/{id}`           | DELETE         | X       | O     | **만화 삭제**                |
| `/mangas/{id}/reviews`   | POST           | O       | O     | 만화에 리뷰 작성             |
| `/reviews/{id}`          | PUT            | O(본인) | X     | 리뷰 수정 (본인만 가능)      |
| `/reviews/{id}`          | DELETE         | O(본인) | O     | 리뷰 삭제 (본인 또는 관리자) |
| `/reviews/{id}/comments` | POST           | O       | O     | 리뷰에 댓글 작성             |
| `/comments/{id}`         | PUT            | O(본인) | X     | 댓글 수정 (본인만 가능)      |
| `/comments/{id}`         | DELETE         | O(본인) | O     | 댓글 삭제 (본인 또는 관리자) |

_(O: 허용, X: 금지, O(본인): 리소스 소유자일 경우 허용)_

## 테스트 계정

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

## 엔드포인트

- **Swagger 문서 주소**: `http://localhost:8080/docs`
- **API Base URL**: `http://localhost:8080/v1/api`

| 리소스        | Method | URL                       | 설명 (주요 기능)                        | 인증 | 역할         |
| :------------ | :----- | :------------------------ | :-------------------------------------- | :--- | :----------- |
| **Auth**      | POST   | `/auth/login`             | 사용자 로그인 및 토큰 발급              | X    | -            |
|               | POST   | `/auth/logout`            | 로그아웃 (Refresh Token 무효화)         | O    | User, Admin  |
|               | POST   | `/auth/refresh`           | 액세스 토큰 재발급                      | X    | -            |
|               | GET    | `/auth/google`            | Google OAuth 로그인 시작                | X    | -            |
|               | GET    | `/auth/google/callback`   | Google OAuth 콜백 처리                  | X    | -            |
|               | POST   | `/auth/firebase-login`    | Github OAuth 로그인 시작                | X    | -            |
| **Users**     | POST   | `/users`                  | 회원가입                                | X    | -            |
|               | GET    | `/users/me`               | 내 프로필 조회                          | O    | User, Admin  |
|               | PUT    | `/users/me`               | 내 프로필 수정                          | O    | User, Admin  |
|               | DELETE | `/users/me`               | 회원 탈퇴                               | O    | User, Admin  |
|               | GET    | `/users`                  | 모든 사용자 조회                        | O    | **Admin**    |
|               | GET    | `/users/{id}`             | 특정 사용자 조회                        | O    | **Admin**    |
|               | PATCH  | `/users/{id}/role`        | 사용자 역할 변경                        | O    | **Admin**    |
| **Mangas**    | GET    | `/mangas`                 | 만화 목록 조회 (페이지네이션/검색/정렬) | X    | -            |
|               | GET    | `/mangas/{id}`            | 특정 만화 상세 조회                     | X    | -            |
|               | POST   | `/mangas`                 | 새 만화 추가                            | O    | **Admin**    |
|               | PUT    | `/mangas/{id}`            | 만화 정보 수정                          | O    | **Admin**    |
|               | DELETE | `/mangas/{id}`            | 만화 삭제                               | O    | **Admin**    |
| **Reviews**   | POST   | `/mangas/{id}/reviews`    | 특정 만화에 리뷰 작성                   | O    | User, Admin  |
|               | GET    | `/mangas/{id}/reviews`    | 특정 만화의 리뷰 목록 조회              | X    | -            |
|               | GET    | `/reviews/{id}`           | 특정 리뷰 상세 조회                     | X    | -            |
|               | GET    | `/users/{id}/reviews`     | 특정 사용자의 리뷰 목록 조회            | X    | -            |
|               | PUT    | `/reviews/{id}`           | 리뷰 수정 (본인만)                      | O    | User (Owner) |
|               | DELETE | `/reviews/{id}`           | 리뷰 삭제 (본인 또는 Admin)             | O    | User, Admin  |
| **Comments**  | POST   | `/reviews/{id}/comments`  | 특정 리뷰에 댓글 작성                   | O    | User, Admin  |
|               | GET    | `/reviews/{id}/comments`  | 특정 리뷰의 댓글 목록 조회              | X    | -            |
|               | PUT    | `/comments/{id}`          | 댓글 수정 (본인만)                      | O    | User (Owner) |
|               | DELETE | `/comments/{id}`          | 댓글 삭제 (본인 또는 Admin)             | O    | User, Admin  |
| **Favorites** | POST   | `/mangas/{id}/favorites`  | 만화 즐겨찾기 추가                      | O    | User, Admin  |
|               | GET    | `/users/{id}/favorites`   | 특정 사용자의 즐겨찾기 목록 조회        | O    | User, Admin  |
| **Stats**     | GET    | `/stats/top-reviews`      | 인기 리뷰 목록 조회                     | X    | -            |
|               | GET    | `/stats/top-rated-mangas` | 평균 평점 높은 만화 목록 조회           | X    | -            |
|               | GET    | `/health`                 | 서버 상태 확인                          | X    | -            |

_(총 31개 엔드포인트)_

## 성능/보안 고려사항

- **API 요청 속도 제한 (Rate Limiting)**: `express-rate-limit`, `rate-limit-redis` 라이브러리를 사용하여 모든 API 요청에 대해 전역적으로 요청 횟수를 제한합니다. 이를 통해 DoS(Denial-of-Service) 공격과 같은 악의적인 요청으로부터 서버를 보호합니다. (예: 15분당 100회)

- **비밀번호 해싱 (Password Hashing)**: 사용자의 비밀번호는 `bcryptjs` 라이브러리를 사용하여 단방향으로 암호화(해싱)되어 데이터베이스에 저장됩니다. 이를 통해 데이터베이스가 유출되더라도 사용자의 실제 비밀번호를 알 수 없도록 합니다.

- **JWT 기반 인증/인가**: Stateless한 API 통신을 위해 JWT(JSON Web Token)를 사용합니다. 수명이 짧은 Access Token으로 API 접근을 제어하고, 수명이 긴 Refresh Token으로 Access Token을 재발급받아 사용자 경험과 보안을 모두 확보합니다.

- **환경 변수 관리**: 데이터베이스 접속 정보, JWT 시크릿 키 등 민감한 정보는 코드가 아닌 `.env` 파일에 저장하여 관리합니다. 이 파일은 `.gitignore`에 등록되어 Git 리포지토리에 포함되지 않으므로, 소스 코드 상에 민감 정보가 노출되지 않습니다.

- **CORS 정책**: `cors` 라이브러리와 `ALLOWED_ORIGINS` 환경 변수를 사용하여, 허용된 출처(Origin)의 프론트엔드 애플리케이션만 API에 접근할 수 있도록 제한합니다.

## 한계와 개선점

- **비즈니스 모델 및 결제**: 현재는 기본적인 리뷰 기능에 초점이 맞춰져 있어, 향후 유료 콘텐츠나 작가 후원 등 비즈니스 모델과 이에 따른 결제 시스템 연동이 필요할 수 있습니다.

- **확장성**: 현재는 단일 서버 인스턴스 배포를 기준으로 합니다. 대규모 트래픽 발생 시, 로드 밸런서를 도입하고 애플리케이션을 여러 인스턴스로 확장(Scale-out)할 수 있는 구조적 개선이 필요합니다.
