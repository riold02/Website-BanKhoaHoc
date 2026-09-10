import { Request, Response, NextFunction } from "express";
import { classService } from "../services/class.service";
import { sendSuccess } from "../utils/response.util";

export class ClassController {
  async listClasses(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await classService.listClasses(
          req.query.periodId as string | undefined,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getClassById(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await classService.getClassById(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await classService.listSessions(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await classService.createClass(req.body), 201);
    } catch (error) {
      next(error);
    }
  }

  async allocateStudents(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await classService.allocateStudents(
          req.params.id,
          req.body.registrationIds,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async removeStudent(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await classService.removeStudent(
          req.params.id,
          req.params.enrollmentId,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await classService.deleteClass(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async generateSessions(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await classService.generateSessions({
          classId: req.params.id,
          ...req.body,
        }),
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async saveAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await classService.saveAttendance({
          classId: req.params.id,
          sessionId: req.params.sessionId,
          attendances: req.body.attendances,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async configureGradeComponents(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      return sendSuccess(
        res,
        await classService.configureGradeComponents(
          req.params.id,
          req.body.components,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getGradebook(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await classService.getGradebook(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async saveGrades(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await classService.saveGrades(
          req.params.id,
          req.params.enrollmentId,
          req.body.grades,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async calculateResults(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(
        res,
        await classService.calculateResults(
          req.params.id,
          req.params.enrollmentId,
        ),
      );
    } catch (error) {
      next(error);
    }
  }
}

export const classController = new ClassController();
