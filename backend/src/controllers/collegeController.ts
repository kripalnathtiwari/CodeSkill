import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAllColleges = async (req: Request, res: Response) => {
  try {
    const collections = await prisma.collegeCollection.findMany({
      include: { students: true },
      orderBy: { uploadedAt: 'desc' }
    });
    res.status(200).json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

export const createCollege = async (req: Request, res: Response) => {
  try {
    const { collegeEmail, collegeName, category, students } = req.body;
    
    if (!collegeEmail || !category) {
      res.status(400).json({ error: 'collegeEmail and category are required' });
      return;
    }

    const newCollection = await prisma.collegeCollection.create({
      data: {
        collegeEmail,
        collegeName,
        category,
        students: {
          create: students.map((s: any) => ({
            name: s.name,
            email: s.email,
            phone: s.phone,
            regNum: s.regNum
          }))
        }
      },
      include: { students: true }
    });

    res.status(201).json(newCollection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
};

export const updateCollege = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, students } = req.body;

    // Delete existing students
    await prisma.collegeStudent.deleteMany({
      where: { collectionId: id }
    });

    // Update collection and add new students
    const updatedCollection = await prisma.collegeCollection.update({
      where: { id },
      data: {
        category,
        students: {
          create: students.map((s: any) => ({
            name: s.name,
            email: s.email,
            phone: s.phone,
            regNum: s.regNum
          }))
        }
      },
      include: { students: true }
    });

    res.status(200).json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
};

export const deleteCollege = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch the collection to archive it
    const collectionToArchive = await prisma.collegeCollection.findUnique({
      where: { id },
      include: { students: true }
    });

    if (collectionToArchive) {
      await prisma.archiveRecord.create({
        data: {
          entityType: 'COLLEGE_COLLECTION',
          originalId: collectionToArchive.id,
          data: JSON.stringify(collectionToArchive),
          // deletedBy can be populated if we decode the JWT to get user ID
        }
      });
    }

    await prisma.collegeCollection.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
};
