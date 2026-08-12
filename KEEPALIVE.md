# Prevent Render Backend From Sleeping

## Problem
Render's free tier puts apps to sleep after **15 minutes** of inactivity. This causes:
- Cold starts (5-30 second delay on first request)
- Poor user experience
- Failed requests during sleep period

## Solution
Use **cron-job.org** to ping the `/health` endpoint every 10 minutes. This keeps the backend active 24/7.

---

## Setup Instructions (5 minutes)

### 1. Create cron-job.org Account
1. Go to **https://cron-job.org**
2. Click **Sign Up** (top right)
3. Enter email and password
4. Verify email (check inbox)
5. Log in

### 2. Create Keepalive Cronjob
1. Click **Create Cronjob** (after logging in)
2. Fill in the form:

| Field | Value |
|-------|-------|
| **Title** | ESI Backend Keepalive |
| **URL** | `https://esi-backend.onrender.com/health` |
| **Schedule** | Every 10 minutes |
| **Method** | GET |
| **Timeout** | 30 seconds |
| **Auth** | None |

3. Click **Create**

### 3. Enable the Cronjob
- Toggle the **Enable** switch to ON
- You should see: "Status: ENABLED" in green

### 4. Verify It's Working
1. Wait 10-15 minutes
2. Open Render dashboard: https://dashboard.render.com
3. Click your **esi-backend** service
4. Open **Logs** tab
5. Look for: `✓ Health check ping received`

**Example log output:**
```
2026-08-12 15:10:23.456 ✓ Health check ping received
2026-08-12 15:20:23.789 ✓ Health check ping received
2026-08-12 15:30:24.012 ✓ Health check ping received
```

If you see these logs, **Keepalive is working!** ✅

---

## Health Endpoint Details

### URL
```
GET https://esi-backend.onrender.com/health
```

### Response (200 OK)
```json
{
  "status": "ok",
  "service": "ESI Backend",
  "version": "1.0.0",
  "timestamp": "2026-08-12 15:10:23.456789"
}
```

### Why Every 10 Minutes?
- Render sleeps after 15 minutes of inactivity
- Pinging every 10 minutes keeps it awake
- Uses minimal resources (~1KB per request)
- Cost: $0 (cron-job.org is free)

---

## Monitoring

### Check if Backend is Sleeping
1. Go to Render dashboard
2. Click **esi-backend** → **Logs**
3. If you don't see health check logs for 20+ minutes, it's sleeping

### Manual Test
```bash
curl https://esi-backend.onrender.com/health
```

Expected response:
```json
{"status":"ok","service":"ESI Backend","version":"1.0.0","timestamp":"2026-08-12 15:10:23.456789"}
```

---

## Troubleshooting

### Cronjob says "FAILED"
- Check backend URL is correct
- Verify backend is deployed on Render
- Check Render service is not paused
- Try manual curl in terminal

### Still sleeping after setup?
- Verify cronjob is ENABLED (green toggle)
- Check logs in cron-job.org dashboard
- Verify the exact URL including https://

### Want faster checks?
- Change cron-job.org schedule to **Every 5 minutes** (costs $0 still)
- This guarantees zero cold starts

---

## Cost Analysis

| Service | Cost | Purpose |
|---------|------|---------|
| Render Backend (free tier) | $0 | Run FastAPI app |
| cron-job.org (free) | $0 | Keepalive pings |
| Vercel Frontend | $0 | React app |
| Supabase PostgreSQL | ~$15/mo | Database (optional) |
| **Total** | **~$15/mo** | Production ESI |

---

## FAQ

**Q: Will this increase Render costs?**
A: No, you're still on free tier. Render free tier has unlimited requests. The health checks use minimal bandwidth.

**Q: What if I don't set this up?**
A: Backend will sleep after 15 minutes. First request after sleep takes 10-30 seconds.

**Q: Can I use a different keepalive service?**
A: Yes! Any cron service works:
- uptimerobot.com (free)
- pingdom.com (free trial)
- healthchecks.io (free tier)

**Q: How do I disable keepalive?**
A: Go to cron-job.org, find the cronjob, toggle **Enable** to OFF.

---

**Built with ❤️ by ESI Tech - Emmanuel & Simon**
