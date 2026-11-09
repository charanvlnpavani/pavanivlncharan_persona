/**
 * Creates the admin account, or resets its password if it already exists.
 * There is deliberately no public sign-up endpoint.
 *
 *   npm run create-admin
 *   ADMIN_EMAIL=me@x.com ADMIN_NAME="Me" ADMIN_PASSWORD='...' npm run create-admin   (non-interactive)
 */
import { createInterface } from "node:readline";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../services/auth.service";

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // Don't echo the password while typing.
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      if (s.includes(question)) process.stdout.write(s);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    }),
  );
}

const schema = z.object({
  email: z.email("Enter a valid email"),
  name: z.string().min(1, "Name is required").max(80),
  password: z
    .string()
    .min(12, "Use at least 12 characters")
    .max(200)
    .refine((p) => /[a-z]/i.test(p) && /\d/.test(p), "Use letters and at least one number"),
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? (await ask("Admin email: "));
  const name = process.env.ADMIN_NAME ?? ((await ask("Display name [Admin]: ")) || "Admin");
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await ask("Password (min 12 chars, letters + a number): ", true);
    const confirm = await ask("Repeat password: ", true);
    if (password !== confirm) throw new Error("Passwords do not match");
  }

  const input = schema.parse({ email: email.toLowerCase(), name, password });
  const passwordHash = await hashPassword(input.password);
  const existing = await prisma.adminUser.findUnique({ where: { email: input.email } });

  await prisma.adminUser.upsert({
    where: { email: input.email },
    create: { email: input.email, name: input.name, passwordHash },
    update: { name: input.name, passwordHash },
  });
  if (existing) await prisma.session.deleteMany({ where: { userId: existing.id } }); // sign out everywhere

  console.log(existing ? `Password reset for ${input.email}.` : `Admin ${input.email} created. Log in at the admin panel.`);
}

main()
  .catch((err) => {
    console.error(err instanceof z.ZodError ? err.issues.map((i) => i.message).join("\n") : (err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
