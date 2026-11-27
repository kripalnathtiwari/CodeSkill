import test from "node:test";
import assert from "node:assert/strict";
import prisma from "../config/db";
import * as cloudinaryService from "../services/cloudinaryService";
import {
  createGlobalNote,
  deleteNote,
  getGlobalNotes,
  getNoteById,
  updateNote,
} from "../controllers/noteController";
import { closeAllRedisConnections } from "../lib/redis";
import { clearMemoryCacheForTests } from "../middlewares/cacheMiddleware";

const createMockRes = () => {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: any = null;
  const res: any = {
    setHeader(k: string, v: string) {
      headers[k.toLowerCase()] = String(v);
    },
    getHeader(k: string) {
      return headers[k.toLowerCase()];
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      body = data;
      return res;
    },
    get _status() {
      return statusCode;
    },
    get _body() {
      return body;
    },
  };
  return res;
};

test.before(async () => {
  await closeAllRedisConnections();
  clearMemoryCacheForTests();
});

test.after(async () => {
  await closeAllRedisConnections();
});

test("getGlobalNotes validates limit <= 100 and returns paginated response without full content", async () => {
  const invalidRes = createMockRes();
  await getGlobalNotes({ query: { page: "1", limit: "250" } } as any, invalidRes);
  assert.equal(invalidRes._status, 400);
  assert.equal(invalidRes._body.success, false);

  const origFindMany = prisma.note.findMany;
  const origCount = prisma.note.count;
  let capturedArgs: any = null;

  (prisma.note as any).findMany = async (args: any) => {
    capturedArgs = args;
    return [
      {
        id: "11111111-1111-4111-8111-111111111111",
        title: "Java Streams",
        courseName: "Java",
        pdfUrl: null,
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        admin: { profile: { firstName: "Admin", lastName: "User" } },
      },
    ];
  };
  (prisma.note as any).count = async () => 45;

  try {
    const res = createMockRes();
    await getGlobalNotes({ query: { page: "2", limit: "20", search: "java" } } as any, res);
    assert.equal(res._status, 200);
    assert.equal(res._body.success, true);
    assert.equal(res._body.pagination.page, 2);
    assert.equal(res._body.pagination.total, 45);
    assert.equal(res._body.pagination.totalPages, 3);
    assert.equal(capturedArgs.skip, 20);
    assert.equal(capturedArgs.take, 20);
    assert.equal(capturedArgs.select.content, undefined);
  } finally {
    (prisma.note as any).findMany = origFindMany;
    (prisma.note as any).count = origCount;
  }
});

test("getNoteById returns full content or 404 when missing", async () => {
  const origFindUnique = prisma.note.findUnique;

  (prisma.note as any).findUnique = async ({ where }: any) => {
    if (where.id === "22222222-2222-4222-8222-222222222222") {
      return {
        id: where.id,
        title: "Full Note",
        content: "Detailed markdown content",
      };
    }
    return null;
  };

  try {
    const okRes = createMockRes();
    await getNoteById(
      { params: { noteId: "22222222-2222-4222-8222-222222222222" } } as any,
      okRes
    );
    assert.equal(okRes._status, 200);
    assert.equal(okRes._body.data.content, "Detailed markdown content");

    const notFoundRes = createMockRes();
    await getNoteById(
      { params: { noteId: "33333333-3333-4333-8333-333333333333" } } as any,
      notFoundRes
    );
    assert.equal(notFoundRes._status, 404);
  } finally {
    (prisma.note as any).findUnique = origFindUnique;
  }
});

test("createGlobalNote rejects invalid PDF signature and unsafe javascript: URLs", async () => {
  const badSigRes = createMockRes();
  await createGlobalNote(
    {
      user: { id: "admin-1" },
      body: { title: "Bad PDF" },
      file: {
        originalname: "fake.pdf",
        mimetype: "application/pdf",
        size: 12,
        buffer: Buffer.from("NOT_A_PDF_FILE"),
      },
    } as any,
    badSigRes
  );
  assert.equal(badSigRes._status, 400);

  const badUrlRes = createMockRes();
  await createGlobalNote(
    {
      user: { id: "admin-1" },
      body: { title: "XSS Note", pdfUrl: "javascript:alert(1)" },
    } as any,
    badUrlRes
  );
  assert.equal(badUrlRes._status, 400);
});

test("updateNote preserves existing pdfUrl when no replacement file or URL is provided", async () => {
  const origFindUnique = prisma.note.findUnique;
  const origUpdate = prisma.note.update;
  let capturedUpdateData: any = null;

  (prisma.note as any).findUnique = async () => ({
    id: "44444444-4444-4444-8444-444444444444",
    title: "Old",
    content: "Old content",
    courseName: "DSA",
    imageUrl: null,
    pdfUrl: "https://res.cloudinary.com/demo/raw/upload/v1/lms/pdfs/notes/existing.pdf",
  });
  (prisma.note as any).update = async ({ data }: any) => {
    capturedUpdateData = data;
    return { id: "44444444-4444-4444-8444-444444444444", ...data };
  };

  try {
    const res = createMockRes();
    await updateNote(
      {
        params: { noteId: "44444444-4444-4444-8444-444444444444" },
        body: { title: "Updated Title", content: "Updated Content", pdfUrl: "" },
      } as any,
      res
    );

    assert.equal(res._status, 200);
    assert.equal(
      capturedUpdateData.pdfUrl,
      "https://res.cloudinary.com/demo/raw/upload/v1/lms/pdfs/notes/existing.pdf"
    );
  } finally {
    (prisma.note as any).findUnique = origFindUnique;
    (prisma.note as any).update = origUpdate;
  }
});

test("deleteNote does not delete arbitrary external URLs from Cloudinary", async () => {
  const origFindUnique = prisma.note.findUnique;
  const origDelete = prisma.note.delete;
  const origDeleteMedia = cloudinaryService.deleteMedia;
  let deleteMediaCalled = false;

  (prisma.note as any).findUnique = async () => ({
    id: "55555555-5555-4555-8555-555555555555",
    pdfUrl: "https://attacker.example.com/?fake=res.cloudinary.com/lms/pdfs/notes/evil.pdf",
  });
  (prisma.note as any).delete = async () => ({});
  (cloudinaryService as any).deleteMedia = async () => {
    deleteMediaCalled = true;
    return {};
  };

  try {
    const res = createMockRes();
    await deleteNote(
      { params: { noteId: "55555555-5555-4555-8555-555555555555" } } as any,
      res
    );
    assert.equal(res._status, 200);
    assert.equal(deleteMediaCalled, false);
  } finally {
    (prisma.note as any).findUnique = origFindUnique;
    (prisma.note as any).delete = origDelete;
    (cloudinaryService as any).deleteMedia = origDeleteMedia;
  }
});
