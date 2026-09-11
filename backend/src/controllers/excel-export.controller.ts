import { Request, Response, NextFunction } from 'express';
import { excelExportService } from '../services/excel-export.service';

export class ExcelExportController {
  async exportClassList(req: Request, res: Response, next: NextFunction) {
    try {
      const buffer = await excelExportService.exportClassList();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="danh-sach-lop.xlsx"');
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async exportGradeSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const buffer = await excelExportService.exportGradeSheet(req.query.classId as string | undefined);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bang-diem.xlsx"');
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async exportTuitionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const buffer = await excelExportService.exportTuitionReport();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bao-cao-hoc-phi.xlsx"');
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export const excelExportController = new ExcelExportController();
