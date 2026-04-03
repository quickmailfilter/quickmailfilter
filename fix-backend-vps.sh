#!/bin/bash
# Email Validator - VPS Backend Revival Script

echo "🔧 Fixing Email Validator Backend..."
echo ""

# Navigate to the backend
cd /var/www/quickmailfilter/backend

echo "1️⃣ Stopping PM2 process..."
pm2 delete quickmailfilter-api 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2

echo ""
echo "2️⃣ Clearing PM2 logs and cache..."
rm -rf /root/.pm2/logs/* 2>/dev/null
rm -rf /root/.pm2/dump.pm2 2>/dev/null

echo ""
echo "3️⃣ Setting up environment variables..."
# Update NODE_ENV to production for VPS
sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env

# Make sure CORS_ORIGIN is set correctly
if ! grep -q "CORS_ORIGIN=https://quickmailfilter.com" .env; then
    sed -i 's/CORS_ORIGIN=.*/CORS_ORIGIN=https:\/\/quickmailfilter.com/' .env
fi

echo "   NODE_ENV is now: $(grep NODE_ENV .env)"
echo "   CORS_ORIGIN is: $(grep CORS_ORIGIN .env)"

echo ""
echo "4️⃣ Verifying backend is built..."
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    echo "   ✅ Backend TypeScript build found"
else
    echo "   ⚠️  Backend build not found, rebuilding..."
    npm run build
fi

echo ""
echo "5️⃣ Testing the server..."
# Start the server in the background briefly to test
timeout 5 node server.js > /tmp/test-server.log 2>&1 &
sleep 2

if grep -q "Server running" /tmp/test-server.log 2>/dev/null; then
    echo "   ✅ Server started successfully"
    killall node 2>/dev/null || true
    sleep 1
else
    echo "   ⚠️  Server output:"
    cat /tmp/test-server.log 2>/dev/null || echo "   No output"
fi

echo ""
echo "6️⃣ Starting backend with PM2..."
pm2 start npm --name "quickmailfilter-api" -- start
sleep 2

echo ""
echo "7️⃣ Checking PM2 status..."
pm2 status | grep quickmailfilter-api

echo ""
echo "8️⃣ Testing API health check..."
sleep 2
HEALTH_CHECK=$(curl -s http://localhost:3004/api/health 2>/dev/null || echo "failed")

if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo "   ✅ API is responding: $HEALTH_CHECK"
else
    echo "   ⚠️  API health check failed. Check logs:"
    pm2 logs quickmailfilter-api --lines 30
fi

echo ""
echo "✨ Backend revival complete!"
echo ""
echo "To view logs: pm2 logs quickmailfilter-api"
echo "To check status: pm2 status"
echo "To restart: pm2 restart quickmailfilter-api"
