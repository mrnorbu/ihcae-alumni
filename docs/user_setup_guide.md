# Production Setup & Deployment Guide

This guide details the complete configuration and deployment steps for the IHCAE Alumni Network platform on the Hostinger VPS production server at **`31.97.229.61`**.

---

## 1. Environment Overview

- **Production Server IP**: `31.97.229.61`
- **Application User**: `ihcae`
- **Application Password**: `Ihcae@2026`
- **Frontend URL**: `https://ihcae.argiasolutions.website`
- **Nginx Root Path**: `/home/ihcae/frontend`
- **Backend Directory**: `/home/ihcae/backend/publish`
- **Systemd Service**: `/etc/systemd/system/ihcae-api.service`
- **Database User**: `ihcae` / `Ihcae@2026`
- **Database Name**: `ihcae_alumni`

---

## 2. Server User & Database Provisioning

### SSH into the Server
Log into the Hostinger VPS as `root` to run administrative commands:
```bash
ssh root@31.97.229.61
```

### Create the Unix User
Create the system user `ihcae` and set the password:
```bash
# 1. Create the system user with home directory and bash shell
sudo adduser ihcae --gecos "" --disabled-password

# 2. Set the password to Ihcae@2026
echo "ihcae:Ihcae@2026" | sudo chpasswd

# 3. Add to sudoers group to allow administration tasks
sudo usermod -aG sudo ihcae
```

### Configure MySQL Database & User
Run this command on the server to create the database, user, and grant privileges:
```bash
sudo mysql -u root -e "
CREATE DATABASE IF NOT EXISTS ihcae_alumni;
CREATE USER IF NOT EXISTS 'ihcae'@'localhost' IDENTIFIED BY 'Ihcae@2026';
GRANT ALL PRIVILEGES ON ihcae_alumni.* TO 'ihcae'@'localhost';
FLUSH PRIVILEGES;
"
```

> [!NOTE]
> If the user `ihcae` already exists and you need to update their password to match:
> ```sql
> ALTER USER 'ihcae'@'localhost' IDENTIFIED BY 'Ihcae@2026';
> FLUSH PRIVILEGES;
> ```

---

## 3. Frontend Deployment (Angular 21)

All commands are run from the **local machine** root folder of the project.

### Step 1: Build the Angular App
Run the production build:
```bash
cd frontend
npm run build
# OR if using pnpm:
pnpm run build
```
This generates static files in `dist/IHCAE.Web/browser/`.

### Step 2: Deploy to Production
Synchronize the build output directly to the server frontend directory:
```bash
# Run this from the frontend/ directory
rsync -avz --delete dist/IHCAE.Web/browser/ ihcae@31.97.229.61:~/frontend/
```

> [!IMPORTANT]
> The trailing slash (`/`) on `dist/IHCAE.Web/browser/` is critical. It ensures that the files inside the folder (like `index.html`) are placed directly under `/home/ihcae/frontend/` instead of nested inside a `browser` subdirectory. This prevents rewrite loop errors in Nginx.

---

## 4. Backend Deployment (.NET 10 Self-Contained)

Because the Hostinger VPS has the .NET 9 runtime installed and the project targets .NET 10, the backend must be published as a **self-contained** application. This bundles the .NET 10 runtime inside the output binary.

### Step 1: Publish the API (Locally)
Run the self-contained Linux-64 publish command from the backend folder:
```bash
cd backend/IHCAE.Api
dotnet publish -c Release -r linux-x64 --self-contained true -o ./publish
```

### Step 2: Deploy to Production
Synchronize the published backend files to the server:
```bash
# Run this from the backend/IHCAE.Api/ directory
rsync -avz --delete publish/ ihcae@31.97.229.61:~/backend/publish/
```

### Step 3: Grant Executable Permissions (On Server)
SSH into the server as `ihcae` or run this command to grant execution permission on the self-contained binary:
```bash
ssh ihcae@31.97.229.61 "chmod +x ~/backend/publish/IHCAE.Api"
```

---

## 5. Systemd Service Configuration

The backend application is managed by systemd as a service.

### Create/Edit Service File
On the server, create the service file:
```bash
sudo nano /etc/systemd/system/ihcae-api.service
```

Paste the following configuration:
```ini
[Unit]
Description=IHCAE Alumni Network API
After=network.target mysql.service

[Service]
WorkingDirectory=/home/ihcae/backend/publish
ExecStart=/home/ihcae/backend/publish/IHCAE.Api
Restart=always
# Restart service after 10 seconds if dotnet crashes
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=ihcae-api
User=ihcae
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

### Enable & Start Service
Run the following systemd control commands:
```bash
# Reload systemd configuration to load the new service
sudo systemctl daemon-reload

# Enable the service to start automatically on system boot
sudo systemctl enable ihcae-api

# Start (or restart) the service
sudo systemctl restart ihcae-api

# Check service status
sudo systemctl status ihcae-api
```

---

## 6. Nginx Web Server Configuration

Nginx acts as a reverse proxy for the backend API and serves the Angular frontend files.

### Edit Nginx Configuration
Open the site configuration file (e.g., `/etc/nginx/sites-available/default` or `/etc/nginx/sites-available/ihcae`):
```bash
sudo nano /etc/nginx/sites-available/default
```

Update/replace the server blocks as follows:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ihcae.argiasolutions.website;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ihcae.argiasolutions.website;

    # SSL Certificates (managed via Let's Encrypt Certbot)
    ssl_certificate /etc/letsencrypt/live/ihcae.argiasolutions.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ihcae.argiasolutions.website/privkey.pem;

    root /home/ihcae/frontend;
    index index.html;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static uploaded files (avatars, attachments, post images)
    location /uploads {
        alias /home/ihcae/backend/publish/wwwroot/uploads;
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

### Validate and Reload Nginx
Check your configuration for syntax errors and restart the server:
```bash
# Test the configuration
sudo nginx -t

# Reload Nginx configuration without downtime
sudo systemctl reload nginx
```

---

## 7. Database Migrations

The backend application is configured to run database migrations automatically on startup (`context.Database.Migrate()`). There is no need to manually run `dotnet ef database update` on the production server.

When the `ihcae-api` service starts, it detects missing migrations, connects to the database using the configured connection string, and updates the database schema automatically.

---

## 8. Verification & Troubleshooting Commands

### Monitor Application Logs
View real-time console logs and application logs from the API:
```bash
# View the last 50 lines of API logs
journalctl -u ihcae-api -n 50 --no-pager

# Stream live API logs (follow logs)
journalctl -u ihcae-api -f
```

### Monitor Nginx Logs
```bash
# Monitor Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Monitor Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Check Process & Port Status
```bash
# Verify the IHCAE.Api binary process is active
ps aux | grep IHCAE.Api

# Check if the API is listening on port 5000
sudo ss -tulpn | grep 5000
```
