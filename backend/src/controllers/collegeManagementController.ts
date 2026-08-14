import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

const syncTutorUsers = async (tutors: any[]) => {
  if (!tutors || tutors.length === 0) return;
  const hashedPassword = await bcrypt.hash("Pass123@", 10);

  for (const t of tutors) {
    if (t.email) {
      const email = t.email.toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        // Create new user with INSTRUCTOR role
        await prisma.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            role: "INSTRUCTOR",
            phoneNumber: t.phone || null,
            profile: {
              create: {
                firstName: t.name || "Instructor",
                lastName: "",
              }
            }
          }
        });
      } else if (existingUser.role === "STUDENT") {
        // Upgrade role to INSTRUCTOR if they were just a student
        await prisma.user.update({
          where: { email },
          data: { role: "INSTRUCTOR" }
        });
      }
    }
  }
};

const syncStudentUsers = async (students: any[]) => {
  if (!students || students.length === 0) return;
  const hashedPassword = await bcrypt.hash("Welcome", 10);

  for (const s of students) {
    if (s.email) {
      const email = s.email.toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        let firstName = s.name || "Student";
        let lastName = "";
        const nameParts = firstName.split(" ");
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ");
        }

        await prisma.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            role: "STUDENT",
            phoneNumber: s.phone || null,
            profile: {
              create: {
                firstName: firstName,
                lastName: lastName,
              }
            }
          }
        });
      }
    }
  }
};

export const getAllInstitutions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const institutions = await prisma.collegeInstitution.findMany({
      include: { tutors: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
};

export const getPublicInstitutions = async (req: Request, res: Response) => {
  try {
    const institutions = await prisma.collegeInstitution.findMany({
      select: {
        id: true,
        name: true,
        adminEmail: true,
        createdAt: true,
        tutors: {
          select: { section: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(institutions);
  } catch (error) {
    console.error('Error fetching public institutions:', error);
    res.status(500).json({ error: 'Failed to fetch public institutions', details: error.message || String(error) });
  }
};

export const createInstitution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, adminEmail, tutors } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const newInstitution = await prisma.collegeInstitution.create({
      data: {
        name,
        adminEmail,
        tutors: {
          create: tutors?.map((t: any) => ({
            name: t.name,
            phone: t.phone,
            domain: t.domain,
            joiningDate: t.joiningDate,
            email: t.email,
            section: t.section,
            trainerId: t.trainerId
          })) || []
        }
      },
      include: { tutors: true }
    });

    // Create user accounts for the tutors
    await syncTutorUsers(tutors);

    res.status(201).json(newInstitution);
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({ error: 'Failed to create institution' });
  }
};

export const updateInstitution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, adminEmail, tutors } = req.body;

    // We can just delete all old tutors and insert new ones
    await prisma.collegeTutor.deleteMany({
      where: { institutionId: id }
    });

    const updatedInstitution = await prisma.collegeInstitution.update({
      where: { id },
      data: {
        name,
        adminEmail,
        tutors: {
          create: tutors?.map((t: any) => ({
            name: t.name,
            phone: t.phone,
            domain: t.domain,
            joiningDate: t.joiningDate,
            email: t.email,
            section: t.section,
            trainerId: t.trainerId
          })) || []
        }
      },
      include: { tutors: true }
    });

    // Create or update user accounts for the tutors
    await syncTutorUsers(tutors);

    res.status(200).json(updatedInstitution);
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({ error: 'Failed to update institution' });
  }
};

export const deleteInstitution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Fetch the institution to archive it
    const institutionToArchive = await prisma.collegeInstitution.findUnique({
      where: { id },
      include: { tutors: true }
    });

    if (institutionToArchive) {
      await prisma.archiveRecord.create({
        data: {
          entityType: 'COLLEGE_INSTITUTION',
          originalId: institutionToArchive.id,
          data: JSON.stringify(institutionToArchive),
          deletedBy: userId
        }
      });
    }

    await prisma.collegeInstitution.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting institution:', error);
    res.status(500).json({ error: 'Failed to delete institution', details: error.message || String(error) });
  }
};

export const deleteTutor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { collegeId, tutorId } = req.params;
    const userId = req.user?.id;

    // Fetch the tutor to archive it
    const tutorToArchive = await prisma.collegeTutor.findUnique({
      where: { id: tutorId }
    });

    if (tutorToArchive) {
      await prisma.archiveRecord.create({
        data: {
          entityType: 'COLLEGE_TUTOR',
          originalId: tutorToArchive.id,
          data: JSON.stringify(tutorToArchive),
          deletedBy: userId
        }
      });
    }

    await prisma.collegeTutor.delete({
      where: { id: tutorId }
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting tutor:', error);
    res.status(500).json({ error: 'Failed to delete tutor', details: error.message || String(error) });
  }
};

// ==========================================
// Course Categories Controllers
// ==========================================

const courseCategoryInclude = {
  classes: {
    include: {
      instructors: true,
      students: true
    },
    orderBy: { createdAt: 'asc' as const }
  },
  instructors: true,
  students: true
};

export const getCourseCategories = async (req: Request, res: Response) => {
  try {
    const { collegeName } = req.query;
    const whereClause: any = {};
    if (collegeName) {
      whereClause.collegeName = String(collegeName);
    }
    const courses = await prisma.collegeCourseCategory.findMany({
      where: whereClause,
      include: courseCategoryInclude,
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching course categories:', error);
    res.status(500).json({ error: 'Failed to fetch course categories', details: error.message });
  }
};

export const getPublicCourseCategories = async (req: Request, res: Response) => {
  try {
    const { collegeName } = req.query;
    const whereClause: any = {};
    if (collegeName) {
      whereClause.collegeName = String(collegeName);
    }
    const courses = await prisma.collegeCourseCategory.findMany({
      where: whereClause,
      select: {
        id: true,
        collegeName: true,
        courseName: true,
        classes: {
          select: {
            id: true,
            className: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching public course categories:', error);
    res.status(500).json({ error: 'Failed to fetch public course categories', details: error.message });
  }
};

export const createCourseCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { collegeName, collegeEmail, courseName, description } = req.body;
    if (!collegeName || !courseName) {
      return res.status(400).json({ error: 'collegeName and courseName are required' });
    }
    const course = await prisma.collegeCourseCategory.create({
      data: {
        collegeName,
        collegeEmail: collegeEmail || null,
        courseName,
        description: description || null
      },
      include: courseCategoryInclude
    });
    res.status(201).json(course);
  } catch (error: any) {
    console.error('Error creating course category:', error);
    res.status(500).json({ error: 'Failed to create course category', details: error.message });
  }
};

export const updateCourseCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { courseName, description } = req.body;
    const updated = await prisma.collegeCourseCategory.update({
      where: { id },
      data: {
        courseName,
        description: description || null
      },
      include: courseCategoryInclude
    });
    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating course category:', error);
    res.status(500).json({ error: 'Failed to update course category', details: error.message });
  }
};

export const deleteCourseCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.collegeCourseCategory.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting course category:', error);
    res.status(500).json({ error: 'Failed to delete course category', details: error.message });
  }
};

// ==========================================
// Class / Section Controllers
// ==========================================

export const createCourseClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // categoryId
    const { className, description } = req.body;
    if (!className) {
      return res.status(400).json({ error: 'className is required' });
    }
    await prisma.collegeCourseClass.create({
      data: {
        categoryId: id,
        className,
        description: description || null
      }
    });
    const updatedCourse = await prisma.collegeCourseCategory.findUnique({
      where: { id },
      include: courseCategoryInclude
    });
    res.status(201).json(updatedCourse);
  } catch (error: any) {
    console.error('Error creating course class:', error);
    res.status(500).json({ error: 'Failed to create course class', details: error.message });
  }
};

export const updateCourseClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { className, description } = req.body;
    const updatedClass = await prisma.collegeCourseClass.update({
      where: { id: classId },
      data: {
        className,
        description: description || null
      }
    });
    const updatedCourse = await prisma.collegeCourseCategory.findUnique({
      where: { id: updatedClass.categoryId },
      include: courseCategoryInclude
    });
    res.status(200).json(updatedCourse);
  } catch (error: any) {
    console.error('Error updating course class:', error);
    res.status(500).json({ error: 'Failed to update course class', details: error.message });
  }
};

export const deleteCourseClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const classObj = await prisma.collegeCourseClass.findUnique({ where: { id: classId } });
    if (!classObj) return res.status(404).json({ error: 'Class not found' });

    await prisma.collegeCourseClass.delete({
      where: { id: classId }
    });
    const updatedCourse = await prisma.collegeCourseCategory.findUnique({
      where: { id: classObj.categoryId },
      include: courseCategoryInclude
    });
    res.status(200).json(updatedCourse);
  } catch (error: any) {
    console.error('Error deleting course class:', error);
    res.status(500).json({ error: 'Failed to delete course class', details: error.message });
  }
};

// ==========================================
// Students & Instructors Controllers
// ==========================================

export const addCourseStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // categoryId
    const classIdFromQuery = req.query.classId ? String(req.query.classId) : null;
    const classIdFromBody = req.body && req.body.classId ? String(req.body.classId) : null;
    const targetClassId = classIdFromBody || classIdFromQuery;

    let studentList: any[] = [];
    if (Array.isArray(req.body)) {
      studentList = req.body;
    } else if (req.body && Array.isArray(req.body.students)) {
      studentList = req.body.students;
    } else if (req.body && (req.body.name || req.body.email)) {
      studentList = [req.body];
    }

    const dataToCreate = studentList.map((s: any) => ({
      categoryId: id,
      classId: s.classId || targetClassId || null,
      name: s.name || 'Unnamed Student',
      email: s.email || '',
      regNum: s.regNum || s.registrationNumber || null,
      phone: s.phone || null
    })).filter((s: any) => s.email || s.name);

    await prisma.collegeCourseStudent.createMany({
      data: dataToCreate
    });

    await syncStudentUsers(dataToCreate);

    const updatedCourse = await prisma.collegeCourseCategory.findUnique({
      where: { id },
      include: courseCategoryInclude
    });
    res.status(200).json(updatedCourse);
  } catch (error: any) {
    console.error('Error adding course student(s):', error);
    res.status(500).json({ error: 'Failed to add student(s)', details: error.message });
  }
};

export const removeCourseStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, studentId } = req.params;
    await prisma.collegeCourseStudent.delete({
      where: { id: studentId }
    });
    const updatedCourse = await prisma.collegeCourseCategory.findUnique({
      where: { id },
      include: courseCategoryInclude
    });
    res.status(200).json(updatedCourse);
  } catch (error: any) {
    console.error('Error removing course student:', error);
    res.status(500).json({ error: 'Failed to remove student', details: error.message });
  }
};

export const assignCourseInstructor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // categoryId
    const { name, email, phone, domain, trainerId, classId } = req.body;
    const classIdFromQuery = req.query.classId ? String(req.query.classId) : null;
    const targetClassId = classId || classIdFromQuery || null;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    await prisma.collegeCourseInstructor.create({
      data: {
        categoryId: id,
        classId: targetClassId,
        name,
        email,
        phone: phone || null,
        domain: domain || null,
        trainerId: trainerId || null
      }
    });

    const updatedCourse = await prisma.collegeCourseCategory.findUnique({
      where: { id },
      include: courseCategoryInclude
    });
    res.status(200).json(updatedCourse);
  } catch (error: any) {
    console.error('Error assigning course instructor:', error);
    res.status(500).json({ error: 'Failed to assign instructor', details: error.message });
  }
};

export const removeCourseInstructor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, instructorId } = req.params;
    await prisma.collegeCourseInstructor.delete({
      where: { id: instructorId }
    });
    const updatedCourse = await prisma.collegeCourseCategory.findUnique({
      where: { id },
      include: courseCategoryInclude
    });
    res.status(200).json(updatedCourse);
  } catch (error: any) {
    console.error('Error removing course instructor:', error);
    res.status(500).json({ error: 'Failed to remove instructor', details: error.message });
  }
};
