const fs = require("fs");

const filePath = "/var/www/autodealercloud/apps/api/src/index.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add bcrypt import after other imports
if (!content.includes("import bcrypt")) {
  const lines = content.split("\n");
  const importIndex = lines.findIndex(l => l.includes("import { NginxManager }"));
  if (importIndex !== -1) {
    lines.splice(importIndex + 1, 0, "import bcrypt from 'bcryptjs'");
    content = lines.join("\n");
    fs.writeFileSync(filePath, content, "utf8");
    console.log("✓ Added bcrypt import");
  }
}
