import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/course.service';
import { sendSuccess } from '../utils/response.util';

export class CourseController {
  async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, categoryId, isActive } = req.query;
      const result = await courseService.listCourses({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        categoryId: categoryId as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      return sendSuccess(res, result.courses, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      return sendSuccess(res, course, 200);
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.createCourse(req.body);
      return sendSuccess(res, course, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.body);
      return sendSuccess(res, course, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseService.deleteCourse(req.params.id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await courseService.listCategories();
      return sendSuccess(res, categories, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
