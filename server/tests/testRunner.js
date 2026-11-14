const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('  REEL RESERVE — AUTOMATED INTEGRATION & SECURITY SUITE  ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert('API Health Status 200 OK', health.status === 200 && health.body.status === 'online');

    // 2. Customer Authentication
    const customerLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'customer@reelreserve.demo', password: 'Customer@123456' }
    );
    assert('Customer Authentication succeeds with JWT token', customerLogin.status === 200 && customerLogin.body.data.token);
    const customerToken = customerLogin.body?.data?.token;

    // 3. Admin Authentication
    const adminLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@reelreserve.demo', password: 'Admin@123456' }
    );
    assert('Admin Authentication succeeds with admin role', adminLogin.status === 200 && adminLogin.body.data.user.role === 'admin');
    const adminToken = adminLogin.body?.data?.token;

    // 4. Role-based authorization guard
    const unauthorizedAdminAccess = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      'Security: Customer token is forbidden (403) from accessing Admin Dashboard',
      unauthorizedAdminAccess.status === 403
    );

    const authorizedAdminAccess = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      'Security: Admin token is granted (200) access to Admin Dashboard',
      authorizedAdminAccess.status === 200 && authorizedAdminAccess.body.data.kpis
    );

    // 5. Movie Catalog Verification (Bollywood & Hollywood)
    const moviesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/movies',
      method: 'GET',
    });
    assert(
      'Movie Catalog returns active list (at least 10 titles including Bollywood & Hollywood)',
      moviesRes.status === 200 && moviesRes.body.count >= 10
    );

    // 6. Concurrency & Double-Booking Protection Test
    const showtimesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/showtimes',
      method: 'GET',
    });
    const sampleShow = showtimesRes.body?.data?.[0];
    assert('Showtimes are scheduled and retrievable', sampleShow && sampleShow._id);

    if (sampleShow) {
      // User A locks seat D7
      const holdA = await makeRequest(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/bookings/hold',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customerToken}`,
          },
        },
        {
          showtimeId: sampleShow._id,
          seats: [{ row: 'D', number: 7, category: 'Gold', price: 420 }],
        }
      );
      assert('User A successfully holds seat D7', holdA.status === 201 && holdA.body.data.bookingId);

      // User B (Admin user attempting to hold same seat D7 simultaneously)
      const holdB = await makeRequest(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/bookings/hold',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        },
        {
          showtimeId: sampleShow._id,
          seats: [{ row: 'D', number: 7, category: 'Gold', price: 420 }],
        }
      );
      assert(
        'Concurrency Guard: User B is rejected (409 Conflict) from booking already-held seat D7',
        holdB.status === 409
      );
    }

    console.log('\n========================================================');
    console.log(`TEST EXECUTION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
}

runTestSuite();

