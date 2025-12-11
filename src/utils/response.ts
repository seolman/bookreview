import { Response } from "express";

type Pagination = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
};

export const sendSuccess = (
  res: Response,
  data: any,
  code: number = 200,
  message?: string
) => {
  res.status(code).json({
    success: true,
    data,
    ...(message && { message }),
  });
};

export const sendSuccessPagination = (
  res: Response,
  data: any[],
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
