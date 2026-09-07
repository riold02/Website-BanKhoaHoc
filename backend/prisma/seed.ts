import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Seed Roles
  const roles = [
    { id: 1, name: 'ADMIN', description: 'Quản trị viên toàn quyền hệ thống' },
    { id: 2, name: 'STAFF', description: 'Giáo vụ và nhân viên quản lý đào tạo' },
    { id: 3, name: 'STUDENT', description: 'Học viên đăng ký và theo học' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log('✅ Roles seeded (ADMIN, STAFF, STUDENT)');

  // Common password hash for test accounts
  const defaultPassword = 'Password123@';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 2. Seed Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cms.dlu.edu.vn' },
    update: {},
    create: {
      email: 'admin@cms.dlu.edu.vn',
      username: 'admin',
      passwordHash,
      roleId: 1,
      profile: {
        create: {
          fullName: 'Quản Trị Viên Hệ Thống',
          phone: '0901112223',
          address: '01 Phù Đổng Thiên Vương, TP. Đà Lạt',
        },
      },
    },
  });
  console.log('✅ Admin user created: admin@cms.dlu.edu.vn / Password123@');

  // 3. Seed Staff
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@cms.dlu.edu.vn' },
    update: {},
    create: {
      email: 'staff@cms.dlu.edu.vn',
      username: 'staff',
      passwordHash,
      roleId: 2,
      profile: {
        create: {
          fullName: 'Giáo Vụ Tuyển Sinh & Đào Tạo',
          phone: '0902223334',
          address: 'Trung tâm Đào tạo DLU, TP. Đà Lạt',
        },
      },
    },
  });
  console.log('✅ Staff user created: staff@cms.dlu.edu.vn / Password123@');

  // 4. Seed Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@cms.dlu.edu.vn' },
    update: {},
    create: {
      email: 'student@cms.dlu.edu.vn',
      username: 'student',
      passwordHash,
      roleId: 3,
      profile: {
        create: {
          fullName: 'Nguyễn Văn An',
          phone: '0912345678',
          address: 'Phường 8, TP. Đà Lạt, Lâm Đồng',
        },
      },
      student: {
        create: {
          studentCode: 'HV-2026-001',
          idCardNumber: '068200001234',
          birthDate: new Date('2003-05-15'),
          gender: 'Nam',
          educationLevel: 'Đại học',
        },
      },
    },
  });
  console.log('✅ Student user created: student@cms.dlu.edu.vn / Password123@');

  // 5. Seed Categories
  const catDev = await prisma.category.upsert({
    where: { name: 'Lập trình & Phát triển Phần mềm' },
    update: {},
    create: {
      name: 'Lập trình & Phát triển Phần mềm',
      description: 'Các khóa đào tạo lập trình thực chiến từ cơ bản đến nâng cao theo chuẩn doanh nghiệp.',
    },
  });

  const catData = await prisma.category.upsert({
    where: { name: 'Dữ liệu & Trí tuệ nhân tạo' },
    update: {},
    create: {
      name: 'Dữ liệu & Trí tuệ nhân tạo',
      description: 'Khóa học về phân tích dữ liệu, Python, SQL và ứng dụng AI thực tế.',
    },
  });

  const catOffice = await prisma.category.upsert({
    where: { name: 'Tin học Văn phòng & Đồ họa' },
    update: {},
    create: {
      name: 'Tin học Văn phòng & Đồ họa',
      description: 'Chứng chỉ tin học chuẩn quốc tế MOS, IC3 và thiết kế đồ họa cơ bản.',
    },
  });

  const catLang = await prisma.category.upsert({
    where: { name: 'Ngoại ngữ & Giao tiếp' },
    update: {},
    create: {
      name: 'Ngoại ngữ & Giao tiếp',
      description: 'Tiếng Anh giao tiếp, luyện thi chứng chỉ IELTS, TOEIC cam kết đầu ra.',
    },
  });

  console.log('✅ Categories seeded');

  // 6. Seed Sample Courses
  const courses = [
    {
      courseCode: 'LP-WEB-01',
      title: 'Lập trình Web Fullstack Chuyên Nghiệp (React + Node.js)',
      description:
        'Học viên được trang bị kiến thức toàn diện từ HTML5, CSS3, JavaScript ES6+, React.js, Tailwind CSS đến xây dựng RESTful API chuẩn mực với Node.js, Express, PostgreSQL. Kết thúc khóa làm đồ án tốt nghiệp thực chiến.',
      totalHours: 90,
      standardPrice: 3800000,
      categoryId: catDev.id,
      isActive: true,
    },
    {
      courseCode: 'LP-PY-02',
      title: 'Python Căn bản & Phân tích Dữ liệu (Data Analysis)',
      description:
        'Làm quen cú pháp Python, xử lý dữ liệu với Pandas, NumPy, trực quan hóa biểu đồ với Matplotlib/Seaborn và tự động hóa công việc văn phòng.',
      totalHours: 60,
      standardPrice: 3200000,
      categoryId: catData.id,
      isActive: true,
    },
    {
      courseCode: 'LP-JAVA-03',
      title: 'Lập trình Java Spring Boot Doanh nghiệp',
      description:
        'Đào tạo kiến trúc Microservices, Spring Boot, Spring Security, Hibernate ORM và triển khai Docker container trong môi trường production.',
      totalHours: 85,
      standardPrice: 4500000,
      categoryId: catDev.id,
      isActive: true,
    },
    {
      courseCode: 'NN-IELTS-01',
      title: 'Luyện thi IELTS Cấp tốc Target 6.5+',
      description:
        'Phương pháp rèn luyện 4 kỹ năng Nghe - Nói - Đọc - Viết với giảng viên bản ngữ và giảng viên đạt IELTS 8.0+. Chấm chữa bài chi tiết hàng tuần.',
      totalHours: 72,
      standardPrice: 5200000,
      categoryId: catLang.id,
      isActive: true,
    },
    {
      courseCode: 'TH-MOS-01',
      title: 'Tin học Văn phòng Quốc tế MOS (Word, Excel, PowerPoint)',
      description:
        'Khóa học thực hành chuyên sâu theo đề thi chứng chỉ Microsoft Office Specialist. Nắm vững kỹ năng bảng tính, biểu đồ, macro nâng cao.',
      totalHours: 45,
      standardPrice: 1800000,
      categoryId: catOffice.id,
      isActive: true,
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      update: course,
      create: course,
    });
  }
  console.log('✅ 5 Standard Courses seeded');

  // 7. Seed Sample Enrollment Period for LP-WEB-01
  const webCourse = await prisma.course.findUnique({ where: { courseCode: 'LP-WEB-01' } });
  if (webCourse) {
    await prisma.enrollmentPeriod.upsert({
      where: { periodCode: 'PERIOD-WEB-K15' },
      update: {},
      create: {
        courseId: webCourse.id,
        periodCode: 'PERIOD-WEB-K15',
        name: 'Khóa Lập trình Web Fullstack K15 - Khai giảng Tháng 10/2026',
        startRegistration: new Date('2026-09-01'),
        endRegistration: new Date('2026-09-30'),
        expectedStartDate: new Date('2026-10-15'),
        tuitionFee: 3500000, // Ưu đãi
        maxCapacity: 25,
        currentEnrolled: 18,
        status: 'OPEN',
      },
    });
    console.log('✅ Sample Enrollment Period created (PERIOD-WEB-K15)');
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
