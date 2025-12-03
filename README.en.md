# Book Review Service Backend

## About The Project

## Installation

## Enviornmental Variables

## Deployment

## Authentication Workflow

## Role Based Access Control

## Example Account


---

## 과제 1

### ERD
User, Book, Order, Review, Favorite/Wishlist, Cart

### Database Docs

### RESTful API Docs

회원가입, 로그인, 로그아웃, 토큰 갱신, 프로필 조회/수정/삭제, JWT 인증, bcrypt 적용

auth
post /auth/login
post /auth/logout
post /auth/refresh

users
post /users
get /users/me
patch /users/me
delete /users/me

도서 등록(관리자), 목록 조회(페이지네이션/정렬/필터링), 상세조회, 수정/삭제(관리자), authors/categories 배열 처리

books
get /books
get /books/:id
post /books
patch /books/:id
delete /books/:id

작성, 조회, 수정/삭제(작성자 본인), 좋아요 등록/취소, Top-N 캐시/성능 고려

reviews
post /books/:bookId/reviews
patch /reviews/:reviewId
delete /reviews/:reviewId
post /reviews/:reviewId/like
delete /reviews/:reviewId/like
get /reviews/top

댓글 CRUD, 좋아요 등록/취소

comments
post /reviews/:reviewId/comments
get /reviews/:reviewId/comments
patch /comments/:commentId
delete /comments/:commentId
post /comments/:commentId/like
delete /comments/:commentId/like

위시리스트/라이브러리: 추가, 조회, 삭제

favorite
get /favorites
post /favorites
delete /favorites/:bookId

library
get /library
post /library
delete /library/:bookId

## 과제 2

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

- books(5)
post /books (admin)
get /books
get /books/:id
put /books/:id
delete /books/:id

- reviews(8)
post /books/:id/reviews
get /books/:id/reviews
get /reviews/:id
put /reviews/:id
delete /reviews/:id
get /users/:id/reviews
get /users/me/reviews

- comments(4)
post /reviews/:id/comments
get /reviews/:id/comments
put /comments/:id
delete /comments/:id

- favorites(4)
post /books/:id/favorites
get /books/:id/favorites
get /users/me/favorites
get /users/:id/favorites

- stats(3)
get /stats/top-reviews
get /stats/top-rated-books
get /healthz
