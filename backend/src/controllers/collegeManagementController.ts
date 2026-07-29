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
