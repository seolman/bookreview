import { Tspec } from "tspec";
import { z } from "zod";

import { Manga, Review, User, Comment } from "./db/schema.js";

import { MyErrorResponse } from "./middlewares/errorMiddleware.js";
import { MyPaginationResponse, MyResponse } from "./utils/response.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "./validations/authValidation.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "./validations/commentValidation.js";
import {
  createMangaSchema,
  updateMangaSchema,
} from "./validations/mangaValidation.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "./validations/reviewValidation.js";
import { updateUserRoleSchema } from "./validations/userValidation.js";

type LoginDto = z.infer<typeof loginUserSchema>["body"];
type RegisterUserDto = z.infer<typeof registerUserSchema>["body"];
type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>["body"];

type CreateMangaDto = z.infer<typeof createMangaSchema>["body"];
type UpdateMangaDto = z.infer<typeof updateMangaSchema>["body"];

type CreateReviewDto = z.infer<typeof createReviewSchema>["body"];
type UpdateReviewDto = z.infer<typeof updateReviewSchema>["body"];

type CreateCommentDto = z.infer<typeof createCommentSchema>["body"];
type UpdateCommentDto = z.infer<typeof updateCommentSchema>["body"];

type UserResponse = Omit<User, "hashedPassword">;

type ReviewWithUser = Review & {
  user: Pick<User, "id" | "username" | "avatarUrl">;
};

type ReviewDetails = ReviewWithUser & {
  manga: Pick<Manga, "id" | "title" | "imageUrl">;
};

type CommentWithUser = Comment & {
  user: Pick<User, "id" | "username" | "avatarUrl">;
};

export type ApiSpec = Tspec.DefineApiSpec<{
  basePath: "/v1/api";
  paths: {
    "/auth/login": {
      post: {
        summary: "사용자 로그인";
        tags: ["Authentication"];
        body: LoginDto;
        responses: {
          200: MyResponse<{ accessToken: string; refreshToken: string }>;
          401: MyErrorResponse;
        };
      };
    };
    "/auth/logout": {
      post: {
        summary: "사용자 로그아웃";
        tags: ["Authentication"];
        security: "jwt";
        responses: { 204: never; 401: MyErrorResponse };
      };
    };
    "/auth/refresh": {
      post: {
        summary: "액세스 토큰 재발급";
        tags: ["Authentication"];
        body: { refreshToken: string };
        responses: {
          200: MyResponse<{ accessToken: string }>;
          401: MyErrorResponse;
        };
      };
    };

    "/users": {
      post: {
        summary: "회원가입";
        tags: ["Users"];
        body: RegisterUserDto;
        responses: {
          201: MyResponse<UserResponse>;
          409: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
      get: {
        summary: "모든 사용자 목록 조회 (Admin Only)";
        tags: ["Users"];
        security: "jwt";
        query: { page?: number; size?: number; sort?: string };
        responses: {
          200: MyPaginationResponse<UserResponse>;
          401: MyErrorResponse;
          403: MyErrorResponse;
        };
      };
    };
    "/users/me": {
      get: {
        summary: "내 프로필 조회";
        tags: ["Users"];
        security: "jwt";
        responses: { 200: MyResponse<UserResponse>; 401: MyErrorResponse };
      };
      put: {
        summary: "내 프로필 수정";
        tags: ["Users"];
        security: "jwt";
        body: Partial<Pick<User, "username" | "avatarUrl">>;
        responses: {
          200: MyResponse<UserResponse>;
          401: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
      delete: {
        summary: "내 계정 삭제";
        tags: ["Users"];
        security: "jwt";
        responses: {
          200: MyResponse<{ message: string }>;
          401: MyErrorResponse;
        };
      };
    };
    "/users/{id}": {
      get: {
        summary: "특정 사용자 정보 조회 (Admin Only)";
        tags: ["Users"];
        security: "jwt";
        path: { id: number };
        responses: {
          200: MyResponse<UserResponse>;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
        };
      };
    };
    "/users/{id}/role": {
      patch: {
        summary: "사용자 역할 변경 (Admin Only)";
        tags: ["Users"];
        security: "jwt";
        path: { id: number };
        body: UpdateUserRoleDto;
        responses: {
          200: MyResponse<Pick<User, "id" | "role">>;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
    };

    "/mangas": {
      get: {
        summary: "만화 목록 조회";
        tags: ["Mangas"];
        query: {
          page?: number;
          size?: number;
          sort?: string;
          keyword?: string;
        };
        responses: { 200: MyPaginationResponse<Manga>; 400: MyErrorResponse };
      };
      post: {
        summary: "새 만화 추가 (Admin Only)";
        tags: ["Mangas"];
        security: "jwt";
        body: CreateMangaDto;
        responses: {
          201: MyResponse<Manga>;
          401: MyErrorResponse;
          403: MyErrorResponse;
          409: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
    };
    "/mangas/{id}": {
      get: {
        summary: "특정 만화 정보 조회";
        tags: ["Mangas"];
        path: { id: number };
        responses: { 200: MyResponse<Manga>; 404: MyErrorResponse };
      };
      put: {
        summary: "만화 정보 수정 (Admin Only)";
        tags: ["Mangas"];
        security: "jwt";
        path: { id: number };
        body: UpdateMangaDto;
        responses: {
          200: MyResponse<Manga>;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
      delete: {
        summary: "만화 삭제 (Admin Only)";
        tags: ["Mangas"];
        security: "jwt";
        path: { id: number };
        responses: {
          204: never;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
        };
      };
    };

    "/mangas/{id}/reviews": {
      get: {
        summary: "특정 만화의 모든 리뷰 조회";
        tags: ["Reviews", "Mangas"];
        path: { id: number };
        query: { page?: number; size?: number; sort?: string };
        responses: {
          200: MyPaginationResponse<ReviewWithUser>;
          400: MyErrorResponse;
        };
      };
      post: {
        summary: "특정 만화에 새 리뷰 작성";
        tags: ["Reviews", "Mangas"];
        security: "jwt";
        path: { id: number };
        body: CreateReviewDto;
        responses: {
          201: MyResponse<Review>;
          401: MyErrorResponse;
          404: MyErrorResponse;
          409: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
    };
    "/users/{id}/reviews": {
      get: {
        summary: "특정 사용자가 작성한 모든 리뷰 조회";
        tags: ["Reviews", "Users"];
        path: { id: number };
        query: { page?: number; size?: number; sort?: string };
        responses: {
          200: MyPaginationResponse<ReviewDetails>;
          400: MyErrorResponse;
        };
      };
    };
    "/reviews/{id}": {
      get: {
        summary: "특정 리뷰 상세 조회";
        tags: ["Reviews"];
        path: { id: number };
        responses: { 200: MyResponse<ReviewDetails>; 404: MyErrorResponse };
      };
      put: {
        summary: "리뷰 수정";
        tags: ["Reviews"];
        security: "jwt";
        path: { id: number };
        body: UpdateReviewDto;
        responses: {
          200: MyResponse<Review>;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
      delete: {
        summary: "리뷰 삭제";
        tags: ["Reviews"];
        security: "jwt";
        path: { id: number };
        responses: {
          204: never;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
        };
      };
    };

    "/reviews/{id}/comments": {
      get: {
        summary: "특정 리뷰의 모든 댓글 조회";
        tags: ["Comments", "Reviews"];
        path: { id: number };
        query: { page?: number; size?: number; sort?: string };
        responses: {
          200: MyPaginationResponse<CommentWithUser>;
          400: MyErrorResponse;
        };
      };
      post: {
        summary: "특정 리뷰에 새 댓글 작성";
        tags: ["Comments", "Reviews"];
        security: "jwt";
        path: { id: number };
        body: CreateCommentDto;
        responses: {
          201: MyResponse<Comment>;
          401: MyErrorResponse;
          404: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
    };
    "/comments/{id}": {
      put: {
        summary: "댓글 수정";
        tags: ["Comments"];
        security: "jwt";
        path: { id: number };
        body: UpdateCommentDto;
        responses: {
          200: MyResponse<Comment>;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
          422: MyErrorResponse;
        };
      };
      delete: {
        summary: "댓글 삭제";
        tags: ["Comments"];
        security: "jwt";
        path: { id: number };
        responses: {
          204: never;
          401: MyErrorResponse;
          403: MyErrorResponse;
          404: MyErrorResponse;
        };
      };
    };

    "/mangas/{id}/favorites": {
      post: {
        summary: "즐겨찾기에 만화 추가";
        tags: ["Favorites", "Mangas"];
        security: "jwt";
        path: { id: number };
        responses: {
          204: never;
          401: MyErrorResponse;
          404: MyErrorResponse;
          409: MyErrorResponse;
        };
      };
    };
    "/users/{id}/favorites": {
      get: {
        summary: "특정 사용자의 즐겨찾기 목록 조회";
        tags: ["Favorites", "Users"];
        path: { id: number };
        responses: { 200: MyResponse<Manga[]>; 404: MyErrorResponse };
      };
    };

    "/stats/top-reviews": {
      get: {
        summary: "평점 높은 리뷰 목록 조회";
        tags: ["Statistics"];
        query: { limit?: number };
        responses: { 200: MyResponse<ReviewDetails[]> };
      };
    };
    "/stats/top-rated-mangas": {
      get: {
        summary: "평균 평점 높은 만화 목록 조회";
        tags: ["Statistics"];
        query: { limit?: number };
        responses: { 200: MyResponse<(Manga & { averageRating: number })[]> };
      };
    };

    "/health": {
      get: {
        summary: "서버 헬스 체크";
        tags: ["System"];
        responses: { 200: { status: "Ok"; uptime: string } };
      };
    };
  };
}>;
