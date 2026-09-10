import { Request, Response, NextFunction } from "express";
import { studentService } from "../services/student.service";
import { sendSuccess } from "../utils/response.util";

export class StudentController {
  async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      const result = await studentService.listStudents({
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.students, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getStudentById(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      return sendSuccess(res, student, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMyStudentProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const student = await studentService.getStudentByUserId(user.userId);
      return sendSuccess(res, student, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMySchedule(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await studentService.getMySchedule(req.user!.userId),
      );
    } catch (error) {
      next(error);
    }
  }

  async getMyAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await studentService.getMyAttendance(req.user!.userId),
      );
    } catch (error) {
      next(error);
    }
  }

  async getMyGrades(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await studentService.getMyGrades(req.user!.userId),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.updateStudent(
        req.params.id,
        req.body,
      );
      return sendSuccess(res, student, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
