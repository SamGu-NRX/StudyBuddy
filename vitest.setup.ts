// Environment for tests. Real secrets are never needed: every test fakes
// external boundaries (Prisma/MongoDB, Resend, OpenAI/Flask) so these are
// placeholders that only satisfy module-level reads.
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "test-secret-not-a-real-credential";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "mongodb://localhost:27017/test";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY ?? "test-resend-key";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "test-openai-key";
process.env.FLASK_API_URL = process.env.FLASK_API_URL ?? "http://127.0.0.1:5000";
