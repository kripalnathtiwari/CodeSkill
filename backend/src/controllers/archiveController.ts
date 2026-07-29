import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAllArchives = async (req: Request, res: Response) => {
  try {
    const archives = await prisma.archiveRecord.findMany({
      orderBy: { deletedAt: 'desc' }
    });
    res.status(200).json(archives);
  } catch (error) {
    console.error('Error fetching archives:', error);
    res.status(500).json({ error: 'Failed to fetch archives' });
  }
};

export const restoreArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const archive = await prisma.archiveRecord.findUnique({ where: { id } });
    
    if (!archive) {
      return res.status(404).json({ error: 'Archive record not found' });
    }

    if ((archive as any).status === 'RESTORED') {
      return res.status(400).json({ error: 'Record is already restored' });
    }

    const payload = JSON.parse(archive.data);

    // Strip relations (arrays or objects) to avoid Prisma nested create errors
    const scalarPayload: any = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value === null || typeof value !== 'object') {
        scalarPayload[key] = value;
      }
    }

    // Convert CONSTANT_CASE to camelCase for Prisma model name
    const modelName = archive.entityType
      .toLowerCase()
      .replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as keyof typeof prisma;

    const delegate = prisma[modelName] as any;
    if (!delegate) {
      return res.status(400).json({ error: `Cannot restore: unknown entity type ${archive.entityType}` });
    }

    // Attempt to insert the record back
    await delegate.create({
      data: scalarPayload
    });

    // Update archive status to RESTORED
    await prisma.archiveRecord.update({
      where: { id },
      data: { status: 'RESTORED' }
    });

    res.status(200).json({ message: 'Record restored successfully' });
  } catch (error: any) {
    console.error('Error restoring archive:', error);
    res.status(500).json({ error: 'Failed to restore record. Conflicting relations or unique constraints.', details: error.message });
  }
};

export const deleteArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.archiveRecord.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting archive:', error);
    res.status(500).json({ error: 'Failed to delete archive record' });
  }
};

export const clearArchives = async (req: Request, res: Response) => {
  try {
    await prisma.archiveRecord.deleteMany({});
    res.status(204).send();
  } catch (error) {
    console.error('Error clearing archives:', error);
    res.status(500).json({ error: 'Failed to clear archive records' });
  }
};
