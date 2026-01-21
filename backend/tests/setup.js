// Test setup for Firebase-based application
require("dotenv").config({ path: ".env" });

// Set test environment
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "error"; // Reduce logging noise in tests

// Mock Firebase Admin for testing
jest.mock("../src/firebase/admin", () => {
  const mockDocRef = {
    set: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue({
      exists: true,
      id: "mock-doc-id",
      data: () => ({ mockField: "mockValue", createdAt: new Date() }),
    }),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };

  const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef),
    add: jest.fn().mockResolvedValue({ id: "mock-id" }),
    get: jest.fn().mockResolvedValue({
      docs: [],
      empty: true,
    }),
    where: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        docs: [],
        empty: true,
      }),
    })),
    orderBy: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        docs: [],
        empty: true,
      }),
    })),
  };

  const mockAuth = {
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
    setCustomUserClaims: jest.fn(),
    getUser: jest.fn(),
  };

  const mockFirestore = {
    collection: jest.fn(() => mockCollectionRef),
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date()),
    },
  };

  const mockBucket = {
    file: jest.fn(() => ({
      save: jest.fn().mockResolvedValue({}),
      makePublic: jest.fn().mockResolvedValue({}),
      download: jest.fn().mockResolvedValue([Buffer.from("test")]),
      delete: jest.fn().mockResolvedValue({}),
    })),
    name: "test-bucket",
  };

  const mockAdmin = {
    auth: jest.fn(() => mockAuth),
    firestore: jest.fn(() => mockFirestore),
    storage: jest.fn(() => ({
      bucket: jest.fn(() => mockBucket),
    })),
  };

  return {
    getAdmin: jest.fn(() => mockAdmin),
    initializeFirebase: jest.fn(() => mockAdmin),
    admin: mockAdmin,
  };
});

beforeAll(async () => {
  console.log("Test environment initialized - using mocked Firebase");
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  console.log("Test cleanup completed");
});

module.exports = {};
