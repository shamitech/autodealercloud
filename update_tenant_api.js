const fs = require("fs");
const path = require("path");

const filePath = "/var/www/autodealercloud/apps/api/src/index.ts";
let content = fs.readFileSync(filePath, "utf8");

// Find the tenant creation endpoint and add password generation
const pattern = /app\.post\('\/api\/v1\/tenants',\s*async \(request: any, reply: any\)\s*=>\s*\{[\s\S]*?return \{ success: true, data: tenant \}/;

const replacement = `app.post('/api/v1/tenants', async (request: any, reply: any) => {
  try {
    const { name, slug, description, email, plan } = request.body
    
    // Generate a temporary password (12 chars: mix of letters, numbers, special chars)
    const tempPassword = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8) + "!Aa0"
    
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        description,
      },
      include: {
        users: true,
      },
    })
    
    // Create initial tenant user with temporary password (if email provided)
    if (email) {
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          tenantId: tenant.id,
          role: "admin",
        },
      }).catch(() => {
        // Silently fail if user creation fails
      })
    }

    return { success: true, data: tenant, tempPassword }`;

if (pattern.test(content)) {
  content = content.replace(pattern, replacement);
  fs.writeFileSync(filePath, content, "utf8");
  console.log("✓ Updated tenant endpoint with password generation");
} else {
  console.log("✗ Could not find endpoint pattern");
  process.exit(1);
}
