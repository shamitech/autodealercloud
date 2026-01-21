import express, { Express, Request, Response, NextFunction } from 'express';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 80;

// Create proxy instance
const proxy = httpProxy.createProxyServer({});

// Domain to service mapping
const getDomainTarget = (host: string): string => {
  // Remove port if present
  const domain = host.split(':')[0];

  // Internal routing for subdomain pattern
  if (domain.includes('-auth.autodealercloud.com')) {
    // Route to core-cms authoring environment
    return 'http://localhost:3001';
  } else if (domain.includes('-stage.autodealercloud.com')) {
    // Route to core-cms staging/preview environment
    return 'http://localhost:3001';
  } else if (domain.includes('-pub.autodealercloud.com')) {
    // Route to core-cms published environment
    return 'http://localhost:3001';
  } else if (domain.includes('account.autodealercloud.com')) {
    // Route to account portal
    return 'http://localhost:3002';
  } else if (domain.includes('admin.autodealercloud.com')) {
    // Route to admin portal
    return 'http://localhost:3003';
  } else if (domain === 'autodealercloud.com' || domain === 'www.autodealercloud.com') {
    // Route main domain
    return 'http://localhost:3001';
  }

  // For custom domains, query database to find the correct instance
  // TODO: Implement database lookup for custom domains
  return 'http://localhost:3001';
};

// Middleware to extract tenant info from domain
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host') || '';
  const domain = host.split(':')[0];

  // Parse subdomain pattern: c10000-e10234-auth.autodealercloud.com
  const match = domain.match(/^([a-z0-9]+)-([a-z0-9]+)-(auth|stage|pub)/);
  if (match) {
    (req as any).tenantInfo = {
      companyId: match[1],
      environmentId: match[2],
      environment: match[3],
      domain,
    };
  }

  next();
});

// Proxy middleware
app.use((req: Request, res: Response) => {
  const target = getDomainTarget(req.get('host') || '');

  proxy.web(req, res, { target }, (error) => {
    console.error('Proxy error:', error);
    res.status(502).json({ error: 'Bad Gateway' });
  });
});

app.listen(PORT, () => {
  console.log(`Domain Router is running on port ${PORT}`);
});
