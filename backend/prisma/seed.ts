import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Seed Roles
  const roles = [
    { id: 1, name: "ADMIN", description: "Quản trị viên toàn quyền hệ thống" },
    {
      id: 2,
      name: "STAFF",
      description: "Giáo vụ và nhân viên quản lý đào tạo",
    },
    { id: 3, name: "STUDENT", description: "Học viên đăng ký và theo học" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log("✅ Roles seeded (ADMIN, STAFF, STUDENT)");

  // Common password hash for test accounts
  const defaultPassword = "Password123@";
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 2. Seed Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cms.dlu.edu.vn" },
    update: {},
    create: {
      email: "admin@cms.dlu.edu.vn",
      username: "admin",
      passwordHash,
      roleId: 1,
      profile: {
        create: {
          fullName: "Quản Trị Viên Hệ Thống",
          phone: "0901112223",
          address: "01 Phù Đổng Thiên Vương, TP. Đà Lạt",
        },
      },
    },
  });
  console.log("✅ Admin user created: admin@cms.dlu.edu.vn / Password123@");

  // 3. Seed Staff
  const staffUser = await prisma.user.upsert({
    where: { email: "staff@cms.dlu.edu.vn" },
    update: {},
    create: {
      email: "staff@cms.dlu.edu.vn",
      username: "staff",
      passwordHash,
      roleId: 2,
      profile: {
        create: {
          fullName: "Giáo Vụ Tuyển Sinh & Đào Tạo",
          phone: "0902223334",
          address: "Trung tâm Đào tạo DLU, TP. Đà Lạt",
        },
      },
    },
  });
  console.log("✅ Staff user created: staff@cms.dlu.edu.vn / Password123@");

  // 4. Seed Student
  const studentUser = await prisma.user.upsert({
    where: { email: "student@cms.dlu.edu.vn" },
    update: {},
    create: {
      email: "student@cms.dlu.edu.vn",
      username: "student",
      passwordHash,
      roleId: 3,
      profile: {
        create: {
          fullName: "Nguyễn Văn An",
          phone: "0912345678",
          address: "Phường 8, TP. Đà Lạt, Lâm Đồng",
        },
      },
      student: {
        create: {
          studentCode: "HV-2026-001",
          idCardNumber: "068200001234",
          birthDate: new Date("2003-05-15"),
          gender: "Nam",
          educationLevel: "Đại học",
        },
      },
    },
  });
  console.log("✅ Student user created: student@cms.dlu.edu.vn / Password123@");

  // 5. Seed Categories
  const catDev = await prisma.category.upsert({
    where: { name: "Lập trình & Phát triển Phần mềm" },
    update: {},
    create: {
      name: "Lập trình & Phát triển Phần mềm",
      description:
        "Các khóa đào tạo lập trình thực chiến từ cơ bản đến nâng cao theo chuẩn doanh nghiệp.",
    },
  });

  const catData = await prisma.category.upsert({
    where: { name: "Dữ liệu & Trí tuệ nhân tạo" },
    update: {},
    create: {
      name: "Dữ liệu & Trí tuệ nhân tạo",
      description:
        "Khóa học về phân tích dữ liệu, Python, SQL và ứng dụng AI thực tế.",
    },
  });

  const catOffice = await prisma.category.upsert({
    where: { name: "Tin học Văn phòng & Đồ họa" },
    update: {},
    create: {
      name: "Tin học Văn phòng & Đồ họa",
      description:
        "Chứng chỉ tin học chuẩn quốc tế MOS, IC3 và thiết kế đồ họa cơ bản.",
    },
  });

  const catLang = await prisma.category.upsert({
    where: { name: "Ngoại ngữ & Giao tiếp" },
    update: {},
    create: {
      name: "Ngoại ngữ & Giao tiếp",
      description:
        "Tiếng Anh giao tiếp, luyện thi chứng chỉ IELTS, TOEIC cam kết đầu ra.",
    },
  });

  console.log("✅ Categories seeded");

  // 6. Seed Sample Courses
  const courses = [
    {
      courseCode: "LP-WEB-01",
      title: "Lập trình Web Fullstack Chuyên Nghiệp (React + Node.js)",
      description:
        "Học viên được trang bị kiến thức toàn diện từ HTML5, CSS3, JavaScript ES6+, React.js, Tailwind CSS đến xây dựng RESTful API chuẩn mực với Node.js, Express, PostgreSQL. Kết thúc khóa làm đồ án tốt nghiệp thực chiến.",
      totalHours: 90,
      standardPrice: 3800000,
      categoryId: catDev.id,
      isActive: true,
    },
    {
      courseCode: "LP-PY-02",
      title: "Python Căn bản & Phân tích Dữ liệu (Data Analysis)",
      description:
        "Làm quen cú pháp Python, xử lý dữ liệu với Pandas, NumPy, trực quan hóa biểu đồ với Matplotlib/Seaborn và tự động hóa công việc văn phòng.",
      totalHours: 60,
      standardPrice: 3200000,
      categoryId: catData.id,
      isActive: true,
    },
    {
      courseCode: "LP-JAVA-03",
      title: "Lập trình Java Spring Boot Doanh nghiệp",
      description:
        "Đào tạo kiến trúc Microservices, Spring Boot, Spring Security, Hibernate ORM và triển khai Docker container trong môi trường production.",
      totalHours: 85,
      standardPrice: 4500000,
      categoryId: catDev.id,
      isActive: true,
    },
    {
      courseCode: "NN-IELTS-01",
      title: "Luyện thi IELTS Cấp tốc Target 6.5+",
      description:
        "Phương pháp rèn luyện 4 kỹ năng Nghe - Nói - Đọc - Viết với giảng viên bản ngữ và giảng viên đạt IELTS 8.0+. Chấm chữa bài chi tiết hàng tuần.",
      totalHours: 72,
      standardPrice: 5200000,
      categoryId: catLang.id,
      isActive: true,
    },
    {
      courseCode: "TH-MOS-01",
      title: "Tin học Văn phòng Quốc tế MOS (Word, Excel, PowerPoint)",
      description:
        "Khóa học thực hành chuyên sâu theo đề thi chứng chỉ Microsoft Office Specialist. Nắm vững kỹ năng bảng tính, biểu đồ, macro nâng cao.",
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
  console.log("✅ 5 Standard Courses seeded");

  // 7. Seed Sample Enrollment Period for LP-WEB-01
  const webCourse = await prisma.course.findUnique({
    where: { courseCode: "LP-WEB-01" },
  });
  if (webCourse) {
    const webPeriod = await prisma.enrollmentPeriod.upsert({
      where: { periodCode: "PERIOD-WEB-K15" },
      update: {},
      create: {
        courseId: webCourse.id,
        periodCode: "PERIOD-WEB-K15",
        name: "Khóa Lập trình Web Fullstack K15 - Khai giảng Tháng 10/2026",
        startRegistration: new Date("2026-09-01"),
        endRegistration: new Date("2026-09-30"),
        expectedStartDate: new Date("2026-10-15"),
        tuitionFee: 3500000, // Ưu đãi
        maxCapacity: 25,
        currentEnrolled: 18,
        status: "OPEN",
      },
    });
    console.log("✅ Sample Enrollment Period created (PERIOD-WEB-K15)");

    const primaryStudentRecord = await prisma.student.findUnique({
      where: { userId: studentUser.id },
    });
    if (primaryStudentRecord) {
      const primaryRegistration = await prisma.registration.upsert({
        where: { registrationCode: "REG-DEMO-WEB-000" },
        update: {
          studentId: primaryStudentRecord.id,
          periodId: webPeriod.id,
          status: "APPROVED",
          reviewedBy: staffUser.id,
          reviewedAt: new Date("2026-09-10"),
        },
        create: {
          registrationCode: "REG-DEMO-WEB-000",
          studentId: primaryStudentRecord.id,
          periodId: webPeriod.id,
          status: "APPROVED",
          note: "Dữ liệu demo để kiểm thử cổng học tập cá nhân",
          reviewedBy: staffUser.id,
          reviewedAt: new Date("2026-09-10"),
        },
      });

      const primaryInvoice = await prisma.tuitionInvoice.upsert({
        where: { registrationId: primaryRegistration.id },
        update: {
          totalAmount: webPeriod.tuitionFee,
          paidAmount: webPeriod.tuitionFee,
          paymentStatus: "PAID",
        },
        create: {
          invoiceCode: "INV-DEMO-WEB-000",
          registrationId: primaryRegistration.id,
          totalAmount: webPeriod.tuitionFee,
          paidAmount: webPeriod.tuitionFee,
          paymentStatus: "PAID",
          dueDate: new Date("2026-10-10"),
        },
      });

      await prisma.paymentTransaction.upsert({
        where: { transactionCode: "PAY-DEMO-WEB-000" },
        update: {
          invoiceId: primaryInvoice.id,
          amount: webPeriod.tuitionFee,
          paymentMethod: "BANK_TRANSFER",
        },
        create: {
          invoiceId: primaryInvoice.id,
          transactionCode: "PAY-DEMO-WEB-000",
          amount: webPeriod.tuitionFee,
          paymentMethod: "BANK_TRANSFER",
          referenceNumber: "DEMO-BANK-000",
          receiverId: staffUser.id,
          note: "Thanh toán demo đầy đủ học phí",
        },
      });
    }

    // 8. Seed paid registrations and empty classes for Member 3/4 testing
    const demoStudents = [
      {
        code: "HV-2026-101",
        username: "student101",
        email: "student101@cms.dlu.edu.vn",
        name: "Trần Minh Khang",
      },
      {
        code: "HV-2026-102",
        username: "student102",
        email: "student102@cms.dlu.edu.vn",
        name: "Lê Ngọc Mai",
      },
      {
        code: "HV-2026-103",
        username: "student103",
        email: "student103@cms.dlu.edu.vn",
        name: "Phạm Gia Huy",
      },
      {
        code: "HV-2026-104",
        username: "student104",
        email: "student104@cms.dlu.edu.vn",
        name: "Võ Khánh Linh",
      },
    ];

    for (const [index, demoStudent] of demoStudents.entries()) {
      const user = await prisma.user.upsert({
        where: { email: demoStudent.email },
        update: {},
        create: {
          email: demoStudent.email,
          username: demoStudent.username,
          passwordHash,
          roleId: 3,
          profile: {
            create: {
              fullName: demoStudent.name,
              phone: `0912345${String(101 + index).padStart(3, "0")}`,
              address: "TP. Đà Lạt, Lâm Đồng",
            },
          },
        },
      });

      const student = await prisma.student.upsert({
        where: { userId: user.id },
        update: { studentCode: demoStudent.code },
        create: {
          userId: user.id,
          studentCode: demoStudent.code,
          idCardNumber: `06820000${String(101 + index).padStart(4, "0")}`,
          birthDate: new Date(`200${3 + (index % 3)}-0${5 + index}-15`),
          gender: index % 2 === 0 ? "Nam" : "Nữ",
          educationLevel: "Đại học",
        },
      });

      const registration = await prisma.registration.upsert({
        where: { registrationCode: `REG-DEMO-WEB-${index + 1}` },
        update: {
          studentId: student.id,
          periodId: webPeriod.id,
          status: "APPROVED",
          reviewedBy: staffUser.id,
          reviewedAt: new Date("2026-09-10"),
        },
        create: {
          registrationCode: `REG-DEMO-WEB-${index + 1}`,
          studentId: student.id,
          periodId: webPeriod.id,
          status: "APPROVED",
          note: "Dữ liệu demo để kiểm thử phân bổ lớp",
          reviewedBy: staffUser.id,
          reviewedAt: new Date("2026-09-10"),
        },
      });

      const invoice = await prisma.tuitionInvoice.upsert({
        where: { registrationId: registration.id },
        update: {
          totalAmount: webPeriod.tuitionFee,
          paidAmount: webPeriod.tuitionFee,
          paymentStatus: "PAID",
        },
        create: {
          invoiceCode: `INV-DEMO-WEB-${index + 1}`,
          registrationId: registration.id,
          totalAmount: webPeriod.tuitionFee,
          paidAmount: webPeriod.tuitionFee,
          paymentStatus: "PAID",
          dueDate: new Date("2026-10-10"),
        },
      });

      await prisma.paymentTransaction.upsert({
        where: { transactionCode: `PAY-DEMO-WEB-${index + 1}` },
        update: {
          invoiceId: invoice.id,
          amount: webPeriod.tuitionFee,
          paymentMethod: index % 2 === 0 ? "BANK_TRANSFER" : "CASH",
        },
        create: {
          invoiceId: invoice.id,
          transactionCode: `PAY-DEMO-WEB-${index + 1}`,
          amount: webPeriod.tuitionFee,
          paymentMethod: index % 2 === 0 ? "BANK_TRANSFER" : "CASH",
          referenceNumber: index % 2 === 0 ? `DEMO-BANK-${index + 1}` : null,
          receiverId: staffUser.id,
          note: "Thanh toán demo đầy đủ học phí",
        },
      });
    }

    const demoClasses = [
      {
        classCode: "WEB-K15-A",
        name: "Lập trình Web Fullstack K15 - Lớp A",
        room: "Phòng A101",
        scheduleDescription: "Thứ 2, 4, 6 - 18:00",
      },
      {
        classCode: "WEB-K15-B",
        name: "Lập trình Web Fullstack K15 - Lớp B",
        room: "Phòng A102",
        scheduleDescription: "Thứ 3, 5, 7 - 18:00",
      },
    ];

    for (const demoClass of demoClasses) {
      await prisma.class.upsert({
        where: { classCode: demoClass.classCode },
        update: {
          periodId: webPeriod.id,
          name: demoClass.name,
          room: demoClass.room,
          scheduleDescription: demoClass.scheduleDescription,
          maxStudents: 10,
          status: "PLANNING",
          startDate: new Date("2026-10-15"),
          endDate: new Date("2026-12-15"),
        },
        create: {
          periodId: webPeriod.id,
          classCode: demoClass.classCode,
          name: demoClass.name,
          room: demoClass.room,
          scheduleDescription: demoClass.scheduleDescription,
          maxStudents: 10,
          status: "PLANNING",
          startDate: new Date("2026-10-15"),
          endDate: new Date("2026-12-15"),
        },
      });
    }

    const primaryClass = await prisma.class.findUnique({
      where: { classCode: "WEB-K15-A" },
    });
    const primaryStudent = await prisma.student.findUnique({
      where: { userId: studentUser.id },
    });
    const primaryRegistration = await prisma.registration.findUnique({
      where: { registrationCode: "REG-DEMO-WEB-000" },
    });
    if (primaryClass && primaryStudent && primaryRegistration) {
      const existingEnrollment = await prisma.classEnrollment.findFirst({
        where: { classId: primaryClass.id, studentId: primaryStudent.id },
      });
      if (existingEnrollment) {
        await prisma.classEnrollment.update({
          where: { id: existingEnrollment.id },
          data: { status: "ACTIVE", registrationId: primaryRegistration.id },
        });
      } else {
        await prisma.classEnrollment.create({
          data: {
            classId: primaryClass.id,
            studentId: primaryStudent.id,
            registrationId: primaryRegistration.id,
          },
        });
      }
    }

    if (primaryClass) {
      const existingSessionCount = await prisma.classSession.count({
        where: { classId: primaryClass.id },
      });
      if (existingSessionCount === 0) {
        const sessionDates: Date[] = [];
        const cursor = new Date("2026-10-15T00:00:00.000Z");
        const weekdays = [1, 3, 5];
        while (sessionDates.length < 12) {
          const weekday = cursor.getUTCDay() === 0 ? 7 : cursor.getUTCDay();
          if (weekdays.includes(weekday)) {
            sessionDates.push(new Date(cursor));
          }
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }

        await prisma.classSession.createMany({
          data: sessionDates.map((sessionDate, index) => ({
            classId: primaryClass.id,
            sessionNumber: index + 1,
            sessionDate,
            topic: `Buổi học Web Fullstack ${index + 1}`,
            status: "SCHEDULED",
          })),
        });
        console.log("✅ 12 sample sessions seeded for student portal");
      }
    }

    console.log(
      "✅ Demo students, APPROVED/PAID registrations and sample classes seeded",
    );
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
