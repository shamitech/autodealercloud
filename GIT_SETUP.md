# 🚀 GIT SETUP & VPS DEPLOYMENT

## Option 1: Use Local Git (Direct File Transfer) - RECOMMENDED FOR VPS

Since you don't have GitHub/GitLab access, we'll use direct file transfer via Git on the VPS.

### Step 1: Create Bare Git Repository on VPS

SSH into your VPS:
```bash
ssh root@185.146.166.77
```

Create a bare git repository on VPS:
```bash
mkdir -p /var/git/autodealercloud.git
cd /var/git/autodealercloud.git
git init --bare
```

### Step 2: Add VPS as Remote on Local Machine

On your local machine (Windows PowerShell):
```bash
cd c:\xampp\htdocs\autodealercloud

# Add the VPS as a remote
git remote add vps ssh://root@185.146.166.77/var/git/autodealercloud.git

# Verify remote added
git remote -v
```

### Step 3: Push to VPS

```bash
# Push the main branch to VPS
git push -u vps master

# This will prompt for password - enter your VPS root password
```

### Step 4: Clone on VPS into Production Directory

Back on the VPS:
```bash
cd /home
git clone /var/git/autodealercloud.git autodealercloud
cd autodealercloud

# Update environment files for production
cp api/.env api/.env.example
cp admin-frontend/.env.local admin-frontend/.env.local.example

# Edit with production values
nano api/.env
nano admin-frontend/.env.local
```

### Step 5: Build and Deploy

```bash
cd /home/autodealercloud

# Install dependencies
npm install

# Build services
npm run build

# Start services
docker compose up -d

# Verify running
docker compose ps
```

---

## Option 2: GitHub Push (If You Setup GitHub Later)

If you want to use GitHub:

### Setup on GitHub

1. Create a new private repository on GitHub
2. Get the HTTPS URL (e.g., `https://github.com/yourusername/autodealercloud.git`)

### Add GitHub Remote

```bash
git remote add github https://github.com/yourusername/autodealercloud.git
git push -u github master
```

### Push Updates

Whenever you make changes:
```bash
git add .
git commit -m "Description of changes"
git push github master  # Push to GitHub
git push vps master     # Also push to VPS if using Option 1
```

---

## Daily Git Workflow

### After Making Local Changes

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with a message
git commit -m "Brief description of changes"

# 4. Push to VPS (Option 1) or GitHub (Option 2)
git push vps master
# OR
git push github master
```

### Pulling Latest on VPS

When you want to update VPS with latest code:

```bash
# SSH into VPS
ssh root@185.146.166.77

# Go to project directory
cd /home/autodealercloud

# Pull latest changes
git pull

# Rebuild and restart if needed
docker compose down
docker compose build
docker compose up -d
```

---

## Troubleshooting Git

### Can't connect to VPS via SSH

**Ensure you have SSH key or password auth:**
```bash
# If using password
git push -u vps master

# If using SSH key (more secure)
# Copy your SSH public key to VPS:
# Cat your key: Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
# Add to VPS: cat ~/.ssh/authorized_keys
```

### Merge conflicts after pull

```bash
# If conflicts occur on pull
git status  # See which files have conflicts

# Resolve conflicts manually in the files
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Undo last commit (if you made a mistake)

```bash
# Keep the changes but undo commit
git reset --soft HEAD~1

# OR discard everything (be careful!)
git reset --hard HEAD~1
```

---

## Setup VPS for Zero-Downtime Deployments

For future reference, you can setup auto-deployment:

### Create Deploy Script on VPS

**File: `/home/autodealercloud/deploy.sh`**
```bash
#!/bin/bash

echo "Pulling latest code..."
cd /home/autodealercloud
git pull origin master

echo "Building services..."
docker compose build

echo "Restarting services..."
docker compose down
docker compose up -d

echo "Deployment complete!"
docker compose ps
```

### Make executable and use

```bash
chmod +x /home/autodealercloud/deploy.sh
./deploy.sh
```

---

## Current Git Status

```
✅ Local Repository Initialized
✅ Initial Commit Created (50 files)
✅ .gitignore configured
⏳ Remote Not Yet Added
⏳ Code Not Yet Pushed to VPS
```

---

## Next Steps

1. **To deploy to VPS immediately:**
   - Follow Option 1 above (Bare Git Repository)
   - Takes 5-10 minutes total

2. **To use GitHub for backup:**
   - Follow Option 2 (GitHub)
   - Can do both simultaneously

3. **Then on VPS:**
   - Pull the code
   - Update .env files
   - Run docker-compose up
   - Done!

---

## Git Commands Reference

| Command | Purpose |
|---------|---------|
| `git status` | See current changes |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Create commit |
| `git push` | Push to remote |
| `git pull` | Get latest from remote |
| `git log` | View commit history |
| `git branch` | View/create branches |
| `git clone` | Clone repository |

---

## Quick Reference: VPS Deployment via Git

```bash
# LOCAL (Windows)
cd c:\xampp\htdocs\autodealercloud
git remote add vps ssh://root@185.146.166.77/var/git/autodealercloud.git
git push -u vps master

# VPS
ssh root@185.146.166.77
mkdir -p /var/git/autodealercloud.git
cd /var/git/autodealercloud.git
git init --bare
cd /home
git clone /var/git/autodealercloud.git autodealercloud
cd autodealercloud
# Edit .env files
docker compose up -d
```

---

**Status**: ✅ Git initialized locally, ready to push to VPS

**Time to Deploy**: ~15 minutes (follow Option 1)

**Next**: Set up VPS bare repository, push code, pull on VPS
