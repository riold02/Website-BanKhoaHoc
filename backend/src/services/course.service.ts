import { prisma } from '../config/database';
import { AppError } from '../utils/response.util';

export class CourseService {
  async listCourses(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { courseCode: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          periods: {
            where: { status: 'OPEN' },
            select: {
              id: true,
              periodCode: true,
              name: true,
              tuitionFee: true,
              startRegistration: true,
              endRegistration: true,
              status: true,
              maxCapacity: true,
              currentEnrolled: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      courses,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        periods: {
          orderBy: { startRegistration: 'desc' },
        },
      },
    });

    if (!course) {
      throw new AppError('Khóa học không tồn tại', 404, 'COURSE_NOT_FOUND');
    }

    return course;
  }

  async createCourse(data: {
    courseCode: string;
    title: string;
    description?: string;
    totalHours: number;
    standardPrice: number;
    categoryId?: string | null;
    isActive?: boolean;
  }) {
    // 1. Kiểm tra trùng courseCode
    const existing = await prisma.course.findUnique({
      where: { courseCode: data.courseCode },
    });

    if (existing) {
      throw new AppError(`Mã khóa học '${data.courseCode}' đã tồn tại`, 409, 'COURSE_CODE_EXISTS');
    }

    // 2. Kiểm tra category nếu có
    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!cat) {
        throw new AppError('Danh mục khóa học không tồn tại', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // 3. Tạo khóa học mới
    const course = await prisma.course.create({
      data: {
        courseCode: data.courseCode,
        title: data.title,
        description: data.description || null,
        totalHours: data.totalHours,
        standardPrice: data.standardPrice,
        categoryId: data.categoryId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        category: true,
      },
    });

    return course;
  }

  async updateCourse(
    id: string,
    data: {
      courseCode?: string;
      title?: string;
      description?: string;
      totalHours?: number;
      standardPrice?: number;
      categoryId?: string | null;
      isActive?: boolean;
    }
  ) {
    // 1. Kiểm tra tồn tại
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new AppError('Khóa học không tồn tại', 404, 'COURSE_NOT_FOUND');
    }

    // 2. Nếu đổi courseCode, kiểm tra trùng lặp
    if (data.courseCode && data.courseCode !== course.courseCode) {
      const existing = await prisma.course.findUnique({ where: { courseCode: data.courseCode } });
      if (existing) {
        throw new AppError(`Mã khóa học '${data.courseCode}' đã tồn tại`, 409, 'COURSE_CODE_EXISTS');
      }
    }

    // 3. Cập nhật
    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(data.courseCode ? { courseCode: data.courseCode } : {}),
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.totalHours !== undefined ? { totalHours: data.totalHours } : {}),
        ...(data.standardPrice !== undefined ? { standardPrice: data.standardPrice } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId || null } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: {
        category: true,
      },
    });

    return updated;
  }

  async deleteCourse(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { periods: true },
    });

    if (!course) {
      throw new AppError('Khóa học không tồn tại', 404, 'COURSE_NOT_FOUND');
    }

    // Nếu đã có đợt tuyển sinh, chuyển sang soft delete (isActive = false)
    if (course.periods.length > 0) {
      const deactivated = await prisma.course.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Khóa học đã có đợt tuyển sinh nên được chuyển sang trạng thái ngưng hoạt động', course: deactivated };
    }

    await prisma.course.delete({ where: { id } });
    return { message: 'Xóa khóa học thành công' };
  }

  async listCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
    return categories;
  }
}

export const courseService = new CourseService();
