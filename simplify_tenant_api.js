const fs = require("fs");

const filePath = "/var/www/autodealercloud/apps/api/src/index.ts";
let content = fs.readFileSync(filePath, "utf8");

// Remove the bcrypt import
content = content.replace("import bcrypt from 'bcryptjs'\n", "");

// Replace the user creation code block  with just password generation
const oldBlock = `    // Create initial tenant user with temporary password (if email provided)
    if (email) {
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          tenantId: tenant.id,
          role: "admin",
          firstName: "Tenant",
          lastName: "Admin",
        },
      }).catch(() => {
        // Silently fail if user creation fails
      })
    }

    return { success: true, data: tenant, tempPassword }`;

const newBlock = `    // Note: User creation with tenant credentials should be done in onboarding flow
    // For now, just return the temporary password to the admin panel

    return { success: true, data: tenant, tempPassword }`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(filePath, content, "utf8");
console.log("✓ Simplified tenant endpoint - removed user creation");
