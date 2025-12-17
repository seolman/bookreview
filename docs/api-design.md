# API 설계 문서

본 문서는 도서 리뷰 서비스 백엔드 API의 설계 원칙과 구조를 설명합니다.

## 1. 설계 원칙

본 API는 **REST(Representational State Transfer)** 아키텍처 스타일을 따릅니다.

- **리소스 기반 URL**: 모든 기능은 `users`, `mangas`, `reviews`와 같은 명사 기반의 리소스 URL로 표현됩니다.
- **표준 HTTP 메서드 활용**: 리소스에 대한 행위는 `GET`(조회), `POST`(생성), `PUT`/`PATCH`(수정), `DELETE`(삭제)와 같은 표준 HTTP 메서드를 통해 명시됩니다.
- **Stateless 통신**: 서버는 클라이언트의 상태를 저장하지 않으며, 모든 요청은 필요한 모든 정보를 담고 있어야 합니다. 인증은 JWT를 통해 처리됩니다.

## 2. 주요 리소스

- **Users**: 사용자 계정 및 프로필 정보
- **Auth**: 인증(로그인, 로그아웃, 토큰 재발급)
- **Mangas**: 만화 정보
- **Reviews**: 만화에 대한 리뷰
- **Comments**: 리뷰에 대한 댓글
- **Favorites**: 즐겨찾기
- **Stats**: 통계 정보

## 3. 공통 응답 형식

API는 모든 응답에 대해 일관된 JSON 구조를 사용합니다.

### 성공 응답 (단일 객체)

```json
{
  "success": true,
  "code": 200,
  "message": "성공 메시지 (선택 사항)",
  "data": {
    "id": 1,
    "title": "Berserk"
  }
}
```

### 성공 응답 (페이지네이션)

```json
{
  "success": true,
  "code": 200,
  "data": [
    { "id": 1, "title": "Berserk" },
    { "id": 2, "title": "Vagabond" }
  ],
  "pagination": {
    "page": 1,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  }
}
```

### 실패 응답

```json
{
  "success": false,
  "error": {
    "timestamp": "2025-12-12T12:00:00.000Z",
    "path": "/v1/api/mangas/999",
    "status": 404,
    "code": "RESOURCE_NOT_FOUND",
    "message": "해당 리소스를 찾을 수 없습니다.",
    "details": { "id": "999" }
  }
}                                                                                                                               
```

## 4. 인증 및 인가

- **인증**: JWT(JSON Web Token) 기반의 토큰 인증 및 **Firebase를 통한 소셜 로그인**을 사용합니다.
  - **Access Token**: 수명이 짧은(15분) 토큰으로, API 요청 시 `Authorization: Bearer <TOKEN>` 헤더에 담아 전송합니다.
  - **Refresh Token**: 수명이 긴(7일) 토큰으로, Access Token이 만료되었을 때 재발급받는 용도로만 사용됩니다.
- **인가**: 역할 기반 접근 제어(RBAC)를 사용합니다.
  - **`user`**: 일반 사용자 역할. 대부분의 읽기 및 자신의 리소스 생성/수정/삭제 권한을 가집니다.
  - **`admin`**: 관리자 역할. 사용자 관리, 만화 정보 관리 등 시스템의 모든 리소스에 접근할 수 있습니다.

## 5. 과제2 대비 변경 사항 요약

- 초기 설계 대비 `Stats`(통계) 리소스를 추가하여 인기 리뷰 및 만화 정보를 제공하는 기능을 구체화했습니다.
- Refresh Token을 데이터베이스에 저장하고 관리하는 로직을 추가하여 로그아웃 시 토큰을 무효화하는 등 보안을 강화했습니다.
- `user`와 `admin` 역할 분리를 더 명확히 하고, 관리자 전용 엔드포인트를 구체적으로 설계했습니다.
- **Firebase를 활용한 소셜 로그인 기능**을 추가하여 사용자 인증 방법을 다양화했습니다.
- **Redis를 이용한 API 응답 캐싱 미들웨어**를 도입하여 반복적인 요청에 대한 응답 속도를 개선했습니다.
- **Prometheus를 통한 서버 메트릭 모니터링**을 구현하여 시스템 성능 및 상태 파악을 용이하게 했습니다.
- **GitHub Actions 기반의 CI/CD 파이프라인**을 구축하여 코드 변경 시 자동 테스트 및 배포 과정을 자동화했습니다.
