import { Response } from "express";

export type MyResponse<T> = {
  success: true;
  data: T;
  /**
   * @example 200
   **/
  code: number;
  message?: string;
};

type Pagination = {
  /**
   * @example 1
   **/
  page: number;
  /**
   * @example 10
   **/
  size: number;
  /**
   * @example 10
   **/
  totalPages: number;
  /**
   * @example 100
   **/
  totalElements: number;
};

export type MyPaginationResponse<T> = {
  success: true;
  data: T[];
  pagination: Pagination;
  /**
   * @example 200
   **/
  code: number;
  message?: string;
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  code: number = 200,
  message?: string
) => {
  res.status(code).json({
    success: true,
    data,
    ...(message && { message }),
  });
};

export const sendSuccessPagination = <T>(
  res: Response,
  data: T[],
  pagination: Pagination,
  code: number = 200,
  message?: string
) => {
  res.status(code).json({
    success: true,
    data,
    pagination,
    ...(message && { message }),
  });
};
