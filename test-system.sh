#!/bin/bash

set -e

echo "🧪 VoltChain System Test Suite"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# 1. Backend Tests
echo "📦 1. Testing Backend..."
echo "-------------------"

echo "Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Installing backend dependencies...${NC}"
    npm install --silent
fi
test_result $? "Backend dependencies installed"

echo "Building backend..."
npm run build > /dev/null 2>&1
test_result $? "Backend TypeScript compilation"

echo "Checking backend health endpoint..."
cd ..
BACKEND_PID=""
if command -v timeout &> /dev/null; then
    cd backend
    timeout 5 npm run dev > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    sleep 3
    cd ..
    
    if curl -s http://localhost:8080/healthz > /dev/null; then
        test_result 0 "Backend health check endpoint"
    else
        test_result 1 "Backend health check endpoint"
    fi
    
    kill $BACKEND_PID 2>/dev/null || true
    sleep 1
else
    echo -e "${YELLOW}⚠ timeout command not available, skipping backend server test${NC}"
fi

# 2. Solana Tests
echo ""
echo "🔗 2. Testing Solana Connection..."
echo "-------------------"

if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version 2>&1 | head -1)
    echo "Solana CLI: $SOLANA_VERSION"
    test_result 0 "Solana CLI installed"
    
    echo "Testing Solana RPC connection (devnet)..."
    if solana cluster-version --url https://api.devnet.solana.com > /dev/null 2>&1; then
        test_result 0 "Solana devnet RPC connection"
    else
        test_result 1 "Solana devnet RPC connection"
    fi
else
    echo -e "${YELLOW}⚠ Solana CLI not installed${NC}"
    test_result 1 "Solana CLI installed"
fi

# Test Node.js Solana connection
echo "Testing Node.js Solana connection..."
cd backend
node -e "
const { Connection } = require('@solana/web3.js');
const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
conn.getVersion().then(() => {
    console.log('✅ Solana RPC connection works');
    process.exit(0);
}).catch((err) => {
    console.error('❌ Solana RPC connection failed:', err.message);
    process.exit(1);
});
" 2>&1
test_result $? "Node.js Solana Web3.js connection"
cd ..

# 3. Anchor Tests
echo ""
echo "⚓ 3. Testing Anchor..."
echo "-------------------"

if command -v anchor &> /dev/null; then
    ANCHOR_VERSION=$(anchor --version 2>&1)
    echo "Anchor CLI: $ANCHOR_VERSION"
    test_result 0 "Anchor CLI installed"
    
    cd onchain
    echo "Checking Anchor program..."
    if [ -f "Anchor.toml" ]; then
        test_result 0 "Anchor.toml configuration exists"
        
        echo "Checking if program is compiled..."
        if [ -d "target/deploy" ] || [ -f "target/idl/voltchain.json" ]; then
            test_result 0 "Anchor program compiled artifacts exist"
        else
            echo -e "${YELLOW}⚠ Program not compiled (run 'anchor build' to compile)${NC}"
            test_result 1 "Anchor program compiled"
        fi
    else
        test_result 1 "Anchor.toml configuration exists"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ Anchor CLI not installed${NC}"
    test_result 1 "Anchor CLI installed"
fi

# 4. Frontend Tests
echo ""
echo "🎨 4. Testing Frontend (Dashboard)..."
echo "-------------------"

cd dashboard
echo "Checking frontend dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Installing frontend dependencies...${NC}"
    npm install --silent
fi
test_result $? "Frontend dependencies installed"

echo "Building frontend..."
npm run build > /tmp/frontend-build.log 2>&1
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
    test_result 0 "Frontend build successful"
else
    echo -e "${YELLOW}⚠ Build errors (check /tmp/frontend-build.log for details)${NC}"
    test_result 1 "Frontend build successful"
fi
cd ..

# 5. Integration Check
echo ""
echo "🔗 5. Integration Check..."
echo "-------------------"

echo "Checking environment files..."
if [ -f "config.example.env" ]; then
    test_result 0 "Example env file exists"
else
    test_result 1 "Example env file exists"
fi

if [ -f ".gitignore" ] && grep -q "\.env" .gitignore; then
    test_result 0 ".gitignore protects .env files"
else
    test_result 1 ".gitignore protects .env files"
fi

# Summary
echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Review the output above.${NC}"
    exit 1
fi

