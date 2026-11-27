# Skincare Web Application — Production Hosting & DevOps Guide
### Automated Production Deployment on AWS EC2 with CloudFormation, Nginx, PM2 & GitHub Actions CI/CD

This document details the complete production hosting architecture, setup procedure, and DevOps solutions implemented for this full-stack web application (**Node.js/Express backend** + **React/Vite frontend** + **MongoDB Atlas Cloud Database**).

Repository: [https://github.com/shreya-nis/deployment](https://github.com/shreya-nis/deployment)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure & Path Mapping](#2-project-structure--path-mapping)
3. [The 4 Infrastructure Files Implemented](#3-the-4-infrastructure-files-implemented)
   - [File 1: CloudFormation Infrastructure (`infra/ec2-instance.yaml`)](#file-1-cloudformation-infrastructure-infraec2-instanceyaml)
   - [File 2: Nginx Web Server & Reverse Proxy (`infra/nginx.conf`)](#file-2-nginx-web-server--reverse-proxy-infranginxconf)
   - [File 3: PM2 Process Manager (`backend/ecosystem.config.cjs`)](#file-3-pm2-process-manager-backendecosystemconfigcjs)
   - [File 4: GitHub Actions CI/CD Pipeline (`.github/workflows/deploy.yml`)](#file-4-github-actions-cicd-pipeline-githubworkflowsdeployyml)
4. [Production Optimizations & Real-World Fixes Applied](#4-production-optimizations--real-world-fixes-applied)
5. [Step-by-Step Setup Guide (From Scratch)](#5-step-by-step-setup-guide-from-scratch)
   - [Step 1: Set Up Cloud Database (MongoDB Atlas)](#step-1-set-up-cloud-database-mongodb-atlas)
   - [Step 2: Start AWS Learner Lab & Get Credentials](#step-2-start-aws-learner-lab--get-credentials)
   - [Step 3: Connect Git & Push to GitHub](#step-3-connect-git--push-to-github)
   - [Step 4: Configure GitHub Secrets & Variables](#step-4-configure-github-secrets--variables)
   - [Step 5: Automated Deployment Trigger](#step-5-automated-deployment-trigger)
   - [Step 6: Verify Live Website](#step-6-verify-live-website)
6. [Handling AWS Lab Expiration & 60-Second Recovery](#6-handling-aws-lab-expiration--60-second-recovery)
7. [Live Server Maintenance & Troubleshooting](#7-live-server-maintenance--troubleshooting)

---

## 1. Architecture Overview

When a user visits your website in their browser, requests flow through the AWS EC2 instance as follows:

```
                            [ USER / BROWSER ]
                                    │
                                    │ HTTP Request (Port 80)
                                    ▼
                  ┌───────────────────────────────────┐
                  │          AWS EC2 INSTANCE         │
                  │         (Ubuntu 24.04 LTS)        │
                  │                                   │
                  │   ┌───────────────────────────┐   │
                  │   │    NGINX (Reverse Proxy)  │   │
                  │   └─────────────┬─────────────┘   │
                  │                 │                 │
                  │    ┌────────────┴───────────┐     │
                  │    │                        │     │
                  │    ▼                        ▼     │
                  │  Static Files           Backend   │
                  │  (Frontend React)       API (PM2) │
                  │  /var/www/app/frontend  Port 5000 │
                  │  /dist                            │
                  └─────────────────────────────┬─────┘
                                                │
                                                │ Database Connection
                                                ▼
                                    [ CLOUD DATABASE ]
                                    (MongoDB Atlas M0 - 24/7)
```

### Core Architecture Highlights:
- **AWS CloudFormation (Infrastructure-as-Code):** Declares the EC2 virtual machine, Port 80 & 22 Security Groups, and SSH key pairs in `infra/ec2-instance.yaml`. No manual AWS console provisioning is required.
- **AWS SSM Parameter Store:** Stores the private SSH key securely in Parameter Store (`/ec2/keypair/*`). GitHub Actions retrieves it dynamically on every deployment.
- **Nginx Web Server:** Acts as the reverse proxy on port 80. Serves React static build files with client-side SPA routing (`try_files $uri $uri/ /index.html`), and routes `/api/` and `/uploads/` directly to Express.
- **PM2 Process Manager:** Runs the Node.js backend in `fork` mode (optimized for single-core `t2.micro` instances) and automatically revives the application if memory spikes or the server restarts.
- **Automated CI/CD:** Every push to `main` builds the React bundle, provisions/updates AWS CloudFormation, retrieves credentials, SSH-es into the EC2 instance, syncs code, builds the frontend, and restarts PM2 and Nginx.

---

## 2. Project Structure & Path Mapping

```
Deployment/
├── .github/
│   └── workflows/
│       └── deploy.yml            <-- Automated CI/CD deployment pipeline
├── backend/
│   ├── config/
│   │   └── db.js                 <-- Connects to MongoDB (supports MONGO_URI & MONGODB_URI)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   │   └── seed.js               <-- Database seed script
│   ├── uploads/                  <-- Statically served media uploads
│   ├── ecosystem.config.cjs      <-- PM2 process manager configuration
│   ├── package.json
│   └── server.js                 <-- Express application entry point (Port 5000)
├── frontend/
│   ├── dist/                     <-- Compiled static frontend assets
│   ├── src/                      <-- React source code
│   │   ├── services/api.js       <-- Axios API client configured for production
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── infra/
│   ├── ec2-instance.yaml         <-- AWS CloudFormation template
│   └── nginx.conf                <-- Production Nginx reverse-proxy configuration
├── .gitignore                    <-- Excludes node_modules, dist, and .env files
└── HOSTING.md                    <-- This documentation file
```

### Path Adaptations for This Repository:
| Template Path | This Project's Path | Purpose |
|---|---|---|
| `client/` | `frontend/` | React/Vite frontend source directory |
| `client/dist` | `frontend/dist` | Nginx web root: `/var/www/app/frontend/dist` |
| `server/` | `backend/` | Node.js/Express backend directory |
| `server/src/server.js` | `backend/server.js` | Entry point for PM2: `server.js` |
| `server/ecosystem.config.cjs` | `backend/ecosystem.config.cjs` | PM2 process configuration |

---

## 3. The 4 Infrastructure Files Implemented

### File 1: CloudFormation Infrastructure (`infra/ec2-instance.yaml`)
Provisions:
1. `ServerKeyPair`: Automatic EC2 KeyPair saved to SSM Parameter Store (`/ec2/keypair/${ServerKeyPair.KeyPairId}`).
2. `ServerSecurityGroup`: Opens Port 80 (HTTP) to `0.0.0.0/0` and Port 22 (SSH) to `0.0.0.0/0`.
3. `ServerInstance`: Ubuntu 24.04 LTS `t2.micro` instance with UserData bootstrapping (installs Node.js 22, Git, Nginx, PM2, prepares `/var/www/app`).
4. Outputs: `PublicIP`, `PublicURL`, and `SSMKeyPath`.

### File 2: Nginx Web Server & Reverse Proxy (`infra/nginx.conf`)
- **SPA Routing:** Configures `root /var/www/app/frontend/dist;` with `try_files $uri $uri/ /index.html;` so page refreshes on React Router routes (e.g., `/shop`, `/cart`, `/admin`) do not return 404.
- **API Proxy:** Routes `/api/` to `http://127.0.0.1:5000/api/` with HTTP/1.1 headers.
- **Uploads Proxy:** Routes `/uploads/` using priority modifier `^~` to prevent image requests from being intercepted by static file regexes.
- **Static Caching:** Caches CSS, JS, fonts, and images for 30 days.

### File 3: PM2 Process Manager (`backend/ecosystem.config.cjs`)
- **App Name:** `skincare-backend`
- **Script:** `server.js`
- **Working Directory:** `/var/www/app/backend`
- **Execution Mode:** `fork` with 1 instance (vital to prevent CPU thrashing on single-core `t2.micro`).
- **Memory Limit:** `max_memory_restart: '300M'` to prevent Out-Of-Memory kills on 1GB RAM machines.

### File 4: GitHub Actions CI/CD Pipeline (`.github/workflows/deploy.yml`)
Automates the full pipeline:
1. **Frontend Pre-build:** Compiles Vite frontend on the runner to catch build errors early.
2. **Infrastructure Deployment:** Deploys `infra/ec2-instance.yaml` via AWS CloudFormation.
3. **SSM Key Retrieval:** Dynamically pulls the private SSH key from AWS Systems Manager into `/tmp/server-key.pem`.
4. **Isolated SSH Execution:** Runs an isolated deployment script (`/tmp/deploy.sh`) on EC2:
   - Configures 1GB swap memory.
   - Syncs code securely using GitHub runner OAuth tokens.
   - Installs backend production dependencies.
   - Generates production `.env` from GitHub Secrets.
   - Builds frontend bundle.
   - Reloads PM2 and validates/reloads Nginx.

---

## 4. Production Optimizations & Real-World Fixes Applied

During configuration and deployment testing, several critical real-world DevOps fixes were applied:

### Fix 1: Eliminating `ERR_CONNECTION_REFUSED localhost:5000`
- **Issue:** Frontend code called `http://localhost:5000` directly. On production, the visitor's browser tried to connect to their own local machine.
- **Fix:** In `frontend/src/services/api.js`, updated the base URL to use relative `/api` in production. In React components (`ProductCard.jsx`, `Cart.jsx`, etc.), updated `getImageSrc` to return relative `/uploads/...` in production so Nginx proxies them to port 5000.

### Fix 2: Resolving Drone-SSH Exit Code Failure in GitHub Actions
- **Issue:** `appleboy/ssh-action` with `script_stop: true` checks `$?` after every line. When testing `[ -d /var/www/app/.git ]`, the false condition returned exit code 1, which drone-ssh misinterpreted as a crash and terminated the build.
- **Fix:** Bundled all EC2 commands into a script file (`cat << 'DEPLOY_SCRIPT' > /tmp/deploy.sh`) and executed it via `bash /tmp/deploy.sh`. This allows standard bash `if/else` execution without drone-ssh line-by-line exit code interference.

### Fix 3: Out-Of-Memory (OOM) Prevention via Swap Memory
- **Issue:** The free-tier AWS `t2.micro` instance has only 1GB RAM. Running `npm ci` and Vite frontend build simultaneously can trigger the Linux OOM-killer.
- **Fix:** Added automated 1GB swap memory allocation (`/swapfile`) during server bootstrap.

### Fix 4: Resolving MongoDB Connection Buffering Timeout
- **Issue:** Signing up on the live site timed out with `Operation users.findOne() buffering timed out after 10000ms`.
- **Fix:** Added `0.0.0.0/0` in MongoDB Atlas Network Access so incoming connections from dynamic EC2 IPs are permitted.

### Fix 5: Dual Database URI Compatibility
- **Issue:** Workflows or configurations may name the connection secret either `MONGO_URI` or `MONGODB_URI`.
- **Fix:** Updated `backend/config/db.js` and `.env` generation to populate and accept both `process.env.MONGO_URI` and `process.env.MONGODB_URI`.

---

## 5. Step-by-Step Setup Guide (From Scratch)

### Step 1: Set Up Cloud Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free account.
2. Create an **M0 Free Cluster** in AWS region `us-east-1`.
3. Under **Database Access**: Create a user (e.g. `shreyakhadka66_db_user`) and password.
4. Under **Network Access**: Click **Add IP Address** $\rightarrow$ **Allow Access from Anywhere (`0.0.0.0/0`)** $\rightarrow$ Confirm.
5. Under **Database $\rightarrow$ Connect $\rightarrow$ Drivers**: Copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.venpgbt.mongodb.net/skincare_store?retryWrites=true&w=majority
   ```

### Step 2: Start AWS Learner Lab & Get Credentials
1. Open your AWS Learner Lab / VocLabs console and click **Start Lab** (wait for the green circle).
2. Click **AWS Details** $\rightarrow$ **Show** next to AWS CLI.
3. Copy the 3 values under `[default]`:
   - `aws_access_key_id`
   - `aws_secret_access_key`
   - `aws_session_token`

### Step 3: Connect Git & Push to GitHub
```bash
git remote set-url origin https://github.com/shreya-nis/deployment.git
git push -u origin main
```

### Step 4: Configure GitHub Secrets & Variables
In GitHub repository **Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions**:

#### Repository Secrets:
| Secret Name | Value Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | From AWS Details CLI (`ASIA...`) |
| `AWS_SECRET_ACCESS_KEY` | From AWS Details CLI |
| `AWS_SESSION_TOKEN` | Full session token string from AWS Details CLI |
| `MONGO_URI` | Full MongoDB connection string from Step 1 |
| `JWT_SECRET` | Secure random string (e.g. `skincare_super_secret_jwt_key_2026_glowskin`) |

#### Repository Variables:
- Name: `AWS_REGION`
- Value: `us-east-1`

### Step 5: Automated Deployment Trigger
Pushing to `main` automatically triggers the GitHub Actions workflow. You can track progress in real-time under the **Actions** tab.

### Step 6: Verify Live Website
Once completed:
1. Open the completed workflow run.
2. Expand **Print Live Web Application URL**.
3. Open `http://<EC2-PUBLIC-IP>` to access your live application.

---

## 6. Handling AWS Lab Expiration & 60-Second Recovery

AWS Learner Lab sessions expire every 4 hours, which temporarily halts the EC2 virtual machine and invalidates the session token.

### Quick Recovery Procedure:
1. Open AWS Learner Lab and click **Start Lab**.
2. Click **AWS Details** $\rightarrow$ **Show** and copy the new keys.
3. Update `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` in GitHub Secrets.
4. Go to **Actions** in GitHub and click **Re-run all jobs**.
5. CloudFormation re-connects to the instance, updates the IP, and restores the live site in under 60 seconds.

---

## 7. Live Server Maintenance & Troubleshooting

Connect to the instance via **EC2 Instance Connect** in the AWS Console:

### Backend Process Health (PM2)
```bash
# Check status of Express API
pm2 status

# View live application logs
pm2 logs --lines 50

# Restart backend process with fresh environment variables
pm2 restart skincare-backend --update-env
```

### Web Server (Nginx)
```bash
# Test Nginx syntax
sudo nginx -t

# Reload Nginx without downtime
sudo systemctl reload nginx

# Monitor live web traffic
sudo tail -f /var/log/nginx/access.log

# Monitor web server errors
sudo tail -f /var/log/nginx/error.log
```

### Seeding Catalog Products
```bash
cd /var/www/app/backend
npm run seed
```

---

*Hosting & DevOps Architecture configured and validated for AWS EC2, Nginx, PM2 & GitHub Actions.*
