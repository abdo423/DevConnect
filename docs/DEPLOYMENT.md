# DevConnect Deployment Guide

## Deployment Options

### 1. Production Deployment (Recommended)

#### Platform Recommendations

**Frontend Deployment:**
- **Vercel** (Recommended) - Seamless React/Vite deployment
- **Netlify** - Great for static sites with form handling
- **AWS S3 + CloudFront** - Scalable with global CDN
- **GitHub Pages** - Free option for open source projects

**Backend Deployment:**
- **Railway** (Recommended) - Simple Node.js deployment
- **Render** - Free tier with automatic deployments
- **Heroku** - Classic platform with easy MongoDB add-ons
- **DigitalOcean App Platform** - Competitive pricing
- **AWS Elastic Beanstalk** - Enterprise-grade scaling

**Database Options:**
- **MongoDB Atlas** (Recommended) - Managed MongoDB service
- **DigitalOcean Managed MongoDB** - Alternative managed service
- **Self-hosted MongoDB** - For advanced users

---

## Frontend Deployment

### Vercel Deployment (Recommended)

1. **Prepare the build:**
```bash
cd Client/devConnect
npm run build
```

2. **Install Vercel CLI:**
```bash
npm i -g vercel
```

3. **Deploy:**
```bash
vercel
# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No  
# - Project name: devconnect-frontend
# - Directory: ./
# - Override settings? No
```

4. **Environment Variables:**
   Add in Vercel dashboard or via CLI:
```bash
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.com
```

5. **Automatic Deployments:**
   Connect your GitHub repository for automatic deployments on push.

### Netlify Deployment

1. **Build configuration:**
   Create `Client/devConnect/netlify.toml`:
```toml
[build]
  base = "Client/devConnect"
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy via Git:**
- Connect repository to Netlify
- Set build directory: `Client/devConnect`
- Set publish directory: `dist`
- Set build command: `npm run build`

### Manual Static Hosting

1. **Build the project:**
```bash
cd Client/devConnect
npm run build
```

2. **Upload `dist/` folder contents to your web server**

3. **Configure web server:**
   **Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/devconnect;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend-url:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Backend Deployment

### Railway Deployment (Recommended)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and initialize:**
```bash
railway login
cd Server
railway init
```

3. **Environment Variables:**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=your-production-jwt-secret
railway variables set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devconnect
```

4. **Deploy:**
```bash
railway up
```

5. **Custom Domain (Optional):**
```bash
railway domain
```

### Render Deployment

1. **Create `Server/render.yaml`:**
```yaml
services:
  - type: web
    name: devconnect-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: MONGODB_URI
        sync: false
```

2. **Connect repository to Render:**
- Import your GitHub repository
- Set root directory: `Server`
- Environment variables will be set from render.yaml

### Heroku Deployment

1. **Install Heroku CLI and login:**
```bash
heroku login
```

2. **Create app:**
```bash
cd Server
heroku create your-app-name
```

3. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-jwt-secret
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devconnect
```

4. **Create Procfile:**
```
web: npm start
```

5. **Deploy:**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### DigitalOcean App Platform

1. **Create `Server/.do/app.yaml`:**
```
name: devconnect-backend
services:
- name: api
  source_dir: /
  github:
    repo: your-username/DevConnect
    branch: main
  run_command: npm start
  build_command: npm install && npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env_vars:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "8080"
  - key: JWT_SECRET
    value: your-production-jwt-secret
    type: SECRET
  - key: MONGODB_URI
    value: mongodb+srv://username:password@cluster.mongodb.net/devconnect
    type: SECRET
```

2. **Deploy via DigitalOcean Dashboard:**
- Create new App
- Connect GitHub repository
- Import app spec from `.do/app.yaml`

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Atlas Account:**
    - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    - Sign up for free account

2. **Create Cluster:**
    - Choose cloud provider and region
    - Select M0 (Free) cluster for development
    - Name your cluster

3. **Configure Access:**
    - **Database Access:** Create user with read/write permissions
    - **Network Access:** Add IP addresses (0.0.0.0/0 for all - not recommended for production)

4. **Get Connection String:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/devconnect?retryWrites=true&w=majority
   ```

5. **Security Best Practices:**
    - Use strong passwords
    - Limit IP access to your servers only
    - Enable authentication
    - Regular security updates

### Self-Hosted MongoDB

**Ubuntu/Debian Installation:**
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Security Configuration:**
```bash
# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "strongpassword",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
})

# Enable authentication in /etc/mongod.conf
security:
  authorization: enabled
```

---

## Environment Configuration

### Production Environment Variables

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/devconnect
JWT_SECRET=your-super-secure-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (production build):**
```env
VITE_API_URL=https://your-backend-url.com
VITE_ENVIRONMENT=production
```

### Configuration Files

**Server Production Config (`Server/config/production.json`):**
```json
{
  "app": {
    "port": 3000,
    "cors": {
      "origin": "https://your-frontend-domain.com",
      "credentials": true
    }
  },
  "db": {
    "connectionString": "mongodb+srv://user:pass@cluster.mongodb.net/devconnect"
  },
  "jwt": {
    "secret": "your-production-jwt-secret",
    "expiresIn": "7d"
  },
  "rateLimit": {
    "windowMs": 900000,
    "max": 100
  }
}
```

---

## SSL/HTTPS Configuration

### Let's Encrypt with Nginx

1. **Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain Certificate:**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Nginx SSL Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Performance Optimization

### Backend Optimization

**Production Dependencies:**
```bash
npm install compression helmet morgan
```

**Server optimizations (`Server/src/index.ts`):**
```typescript
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
```

**Database Connection Pooling:**
```typescript
mongoose.connect(mongoURI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  bufferCommands: false,
  bufferMaxEntries: 0
});
```

### Frontend Optimization

**Build Optimization (`Client/devConnect/vite.config.ts`):**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-dialog'],
          utils: ['axios', 'js-cookie', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

---

## Monitoring and Logging

### Application Monitoring

**Error Tracking with Sentry:**
```bash
npm install @sentry/node @sentry/react
```

**Backend Integration:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Frontend Integration:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENVIRONMENT,
});
```

### Health Check Endpoints

**Backend Health Check:**
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected' });
  }
});
```

---

## Backup and Recovery

### Database Backups

**MongoDB Atlas Backups:**
- Automatic backups included in paid tiers
- Point-in-time recovery available
- Cross-region backup replication

**Manual Backups:**
```bash
# Create backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/devconnect" --out=./backup

# Restore backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/devconnect" ./backup/devconnect
```

**Automated Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/devconnect_$DATE"

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR"

# Upload to cloud storage (example: AWS S3)
aws s3 sync "$BACKUP_DIR" "s3://your-backup-bucket/devconnect/$DATE"

# Keep only last 7 days of backups locally
find /backups -name "devconnect_*" -type d -mtime +7 -exec rm -rf {} +
```

---

## Scaling Considerations

### Horizontal Scaling

**Load Balancing with Nginx:**
```nginx
upstream backend {
    server backend1.example.com:3000;
    server backend2.example.com:3000;
    server backend3.example.com:3000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

**Database Scaling:**
- MongoDB Sharding for horizontal scaling
- Read replicas for read-heavy workloads
- Connection pooling and optimization

### Vertical Scaling

**Server Resources:**
- Monitor CPU and memory usage
- Scale server instances as needed
- Use CDN for static assets

---

## Security Checklist

### Backend Security

- [ ] Environment variables for secrets
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization
- [ ] JWT secret is cryptographically secure
- [ ] Database access restricted by IP
- [ ] Security headers (helmet.js)
- [ ] Regular dependency updates
- [ ] Error messages don't leak sensitive information

### Frontend Security

- [ ] No sensitive data in client code
- [ ] Content Security Policy configured
- [ ] XSS protection implemented
- [ ] HTTPS enforced
- [ ] Secure cookie configuration
- [ ] Regular dependency updates

---

## Deployment Automation

### CI/CD with GitHub Actions

**Frontend Deploy (`.github/workflows/deploy-frontend.yml`):**
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['Client/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd Client/devConnect
          npm ci
          
      - name: Build
        run: |
          cd Client/devConnect
          npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          working-directory: ./Client/devConnect
```

**Backend Deploy (`.github/workflows/deploy-backend.yml`):**
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['Server/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install Railway CLI
        run: npm install -g @railway/cli
        
      - name: Deploy to Railway
        run: |
          cd Server
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

