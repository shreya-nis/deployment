const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const ActivityLog = require('./models/ActivityLog');
const app = require('./server');

dotenv.config({ path: __dirname + '/.env' });

let server;
let port;
let cookie = '';
let token = '';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        if (res.headers['set-cookie']) {
          const rawCookie = res.headers['set-cookie'][0];
          cookie = rawCookie.split(';')[0];
        }
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE INTEGRATION TESTS ---');

  // Start temporary server on dynamic port
  server = app.listen(0);
  port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. PUBLIC STOREFRONT TESTS
    console.log('\n[1] Testing Public Storefront...');
    let res = await makeRequest({ method: 'GET', path: '/api/products' });
    if (res.status !== 200 || !res.data.success || res.data.products.length === 0) {
      throw new Error(`Failed to fetch public products: status ${res.status}`);
    }
    const sampleProduct = res.data.products[0];
    console.log(`  ✓ Public products retrieved successfully (${res.data.products.length} products)`);

    res = await makeRequest({ method: 'GET', path: `/api/products/${sampleProduct._id}` });
    if (res.status !== 200 || res.data.product.name !== sampleProduct.name) {
      throw new Error('Failed to fetch single product');
    }
    console.log(`  ✓ Single product fetched: "${sampleProduct.name}"`);

    // 2. UNAUTHORIZED ACCESS CONTROL
    console.log('\n[2] Testing Unauthorized Access Control...');
    cookie = '';
    token = '';
    res = await makeRequest({ method: 'GET', path: '/api/cart' });
    if (res.status !== 401) throw new Error(`Expected 401 for visitor cart access, got ${res.status}`);
    console.log('  ✓ Unauthenticated cart access blocked (401)');

    res = await makeRequest({ method: 'POST', path: '/api/orders' }, { customerName: 'Test' });
    if (res.status !== 401) throw new Error(`Expected 401 for visitor order creation, got ${res.status}`);
    console.log('  ✓ Unauthenticated order creation blocked (401)');

    res = await makeRequest({ method: 'GET', path: '/api/admin/dashboard' });
    if (res.status !== 401) throw new Error(`Expected 401 for visitor admin access, got ${res.status}`);
    console.log('  ✓ Unauthenticated admin access blocked (401)');

    // 3. REGISTRATION AND ROLE ENFORCEMENT
    console.log('\n[3] Testing Registration & Role Tampering Prevention...');
    const testEmail = `test_customer_${Date.now()}@example.com`;
    res = await makeRequest(
      { method: 'POST', path: '/api/auth/register' },
      {
        name: 'Integration Test Customer',
        email: testEmail,
        password: 'password123',
        phone: '1234567890',
        address: '123 Test Street',
        role: 'admin', // Tamper attempt: public registration must ignore this!
      }
    );

    if (res.status !== 201 || !res.data.success) {
      throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    }
    if (res.data.user.role !== 'user') {
      throw new Error(`CRITICAL: Role tampering succeeded! Got role: ${res.data.user.role}`);
    }
    if (res.data.user.password) {
      throw new Error('CRITICAL: Password hash exposed in registration response!');
    }
    console.log('  ✓ Customer registered successfully and role strictly forced to "user"');

    // Save customer auth token
    const customerToken = res.data.token;
    token = customerToken;

    // 4. CUSTOMER CART OPERATIONS
    console.log('\n[4] Testing Customer Cart Flow...');
    res = await makeRequest({ method: 'GET', path: '/api/cart' });
    if (res.status !== 200 || res.data.cart.items.length !== 0) {
      throw new Error('Initial cart not empty');
    }
    console.log('  ✓ Customer cart initialized empty');

    // Add product to cart
    res = await makeRequest(
      { method: 'POST', path: '/api/cart' },
      { productId: sampleProduct._id, quantity: 2 }
    );
    if (res.status !== 200 || res.data.cart.items.length !== 1) {
      throw new Error('Failed to add product to cart');
    }
    const expectedSubtotal = Math.round(sampleProduct.price * 2 * 100) / 100;
    if (res.data.cart.subtotal !== expectedSubtotal) {
      throw new Error(`Subtotal mismatch: expected ${expectedSubtotal}, got ${res.data.cart.subtotal}`);
    }
    console.log(`  ✓ Product added to cart (Qty: 2, Subtotal: $${res.data.cart.subtotal})`);

    // Update quantity
    res = await makeRequest(
      { method: 'PUT', path: `/api/cart/${sampleProduct._id}` },
      { quantity: 3 }
    );
    if (res.status !== 200 || res.data.cart.items[0].quantity !== 3) {
      throw new Error('Failed to update cart quantity');
    }
    console.log('  ✓ Cart quantity updated to 3');

    // 5. CHECKOUT AND COD ORDER PLACEMENT
    console.log('\n[5] Testing COD Checkout and Stock Management...');
    const initialStock = sampleProduct.stock;
    res = await makeRequest(
      { method: 'POST', path: '/api/orders' },
      {
        customerName: 'Integration Test Customer',
        email: testEmail,
        phone: '1234567890',
        deliveryAddress: '123 Test Street, Suite 4B',
        note: 'Please leave at door',
      }
    );

    if (res.status !== 201 || !res.data.success) {
      throw new Error(`Order placement failed: ${JSON.stringify(res.data)}`);
    }
    const placedOrder = res.data.order;
    if (placedOrder.status !== 'Pending') {
      throw new Error(`Initial status must be 'Pending', got '${placedOrder.status}'`);
    }
    if (placedOrder.paymentMethod !== 'COD') {
      throw new Error(`Payment method must be 'COD', got '${placedOrder.paymentMethod}'`);
    }
    console.log(`  ✓ COD Order placed successfully: #${placedOrder._id.slice(-6).toUpperCase()} (Status: Pending)`);

    // Verify stock decreased
    const updatedProd = await Product.findById(sampleProduct._id);
    if (updatedProd.stock !== initialStock - 3) {
      throw new Error(`Stock not reduced properly: was ${initialStock}, now ${updatedProd.stock}`);
    }
    console.log(`  ✓ Warehouse stock correctly reduced: ${initialStock} -> ${updatedProd.stock}`);

    // Verify cart cleared
    res = await makeRequest({ method: 'GET', path: '/api/cart' });
    if (res.data.cart.items.length !== 0) {
      throw new Error('Cart was not cleared after order placement');
    }
    console.log('  ✓ Customer cart cleared automatically');

    // Customer views own order
    res = await makeRequest({ method: 'GET', path: `/api/orders/${placedOrder._id}` });
    if (res.status !== 200 || res.data.order._id !== placedOrder._id) {
      throw new Error('Customer cannot retrieve own order');
    }
    console.log('  ✓ Customer can retrieve own order');

    // Customer CANNOT access admin orders
    res = await makeRequest({ method: 'GET', path: '/api/orders' });
    if (res.status !== 403) {
      throw new Error(`Customer accessed admin orders! Expected 403, got ${res.status}`);
    }
    console.log('  ✓ Customer blocked from admin order endpoints (403)');

    // 6. ADMIN LOGIN AND WORKFLOW FULFILMENT
    console.log('\n[6] Testing Admin Login & Order Fulfilment Lifecycle...');
    cookie = '';
    token = '';
    res = await makeRequest(
      { method: 'POST', path: '/api/auth/login' },
      { email: 'shreyakhadka66@gmail.com', password: 'adminpassword123' }
    );
    if (res.status !== 200 || res.data.user.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    token = res.data.token;
    console.log('  ✓ Admin logged in successfully');

    // Admin dashboard metrics
    res = await makeRequest({ method: 'GET', path: '/api/admin/dashboard' });
    if (res.status !== 200 || !res.data.stats) {
      throw new Error('Failed to retrieve admin dashboard metrics');
    }
    console.log(`  ✓ Admin dashboard stats retrieved (Delivered Revenue: $${res.data.stats.deliveredRevenue})`);

    // Fulfilment transition: Pending -> Confirmed -> Packed -> Shipped -> Delivered
    const transitions = [
      { next: 'Confirmed', desc: 'Accept Order' },
      { next: 'Packed', desc: 'Pack Items' },
      { next: 'Shipped', desc: 'Dispatch Courier' },
      { next: 'Delivered', desc: 'Customer Received' },
    ];

    for (const step of transitions) {
      res = await makeRequest(
        { method: 'PATCH', path: `/api/orders/${placedOrder._id}/status` },
        { status: step.next, note: `Admin: ${step.desc}` }
      );
      if (res.status !== 200 || res.data.order.status !== step.next) {
        throw new Error(`Failed to transition to ${step.next}: ${JSON.stringify(res.data)}`);
      }
      console.log(`  ✓ Status transitioned -> "${step.next}"`);
    }

    // Disallowed transition check: Delivered -> Packed must be rejected
    res = await makeRequest(
      { method: 'PATCH', path: `/api/orders/${placedOrder._id}/status` },
      { status: 'Packed' }
    );
    if (res.status !== 400) {
      throw new Error(`Illegal transition permitted! Delivered -> Packed returned ${res.status}`);
    }
    console.log('  ✓ Illegal transition (Delivered -> Packed) correctly rejected (400)');

    // 7. CANCELLATION AND 1-TIME STOCK RESTORATION
    console.log('\n[7] Testing Cancellation & Stock Restoration...');
    // Create another order to test cancellation
    const cancelOrder = await Order.create({
      user: updatedProd._id, // any valid user id
      items: [
        {
          product: updatedProd._id,
          productName: updatedProd.name,
          price: updatedProd.price,
          quantity: 2,
          image: updatedProd.image,
        },
      ],
      customerName: 'Cancel Test',
      email: 'cancel@example.com',
      phone: '0000000000',
      deliveryAddress: 'Cancel Lane',
      subtotal: updatedProd.price * 2,
      total: updatedProd.price * 2,
      status: 'Pending',
      stockRestored: false,
    });
    // Manually reduce stock for this test
    await Product.findByIdAndUpdate(updatedProd._id, { $inc: { stock: -2 } });
    const stockBeforeCancel = (await Product.findById(updatedProd._id)).stock;

    // Admin cancels the order
    res = await makeRequest(
      { method: 'PATCH', path: `/api/orders/${cancelOrder._id}/cancel` },
      { reason: 'Customer requested order change' }
    );
    if (res.status !== 200 || res.data.order.status !== 'Cancelled') {
      throw new Error('Order cancellation failed');
    }
    const stockAfterCancel = (await Product.findById(updatedProd._id)).stock;
    if (stockAfterCancel !== stockBeforeCancel + 2) {
      throw new Error(`Stock not restored: before ${stockBeforeCancel}, after ${stockAfterCancel}`);
    }
    console.log(`  ✓ Order cancelled and stock restored: ${stockBeforeCancel} -> ${stockAfterCancel}`);

    // Try cancelling again: stock must NOT be restored a second time!
    res = await makeRequest(
      { method: 'PATCH', path: `/api/orders/${cancelOrder._id}/cancel` },
      { reason: 'Repeated cancellation' }
    );
    const stockAfterRepeat = (await Product.findById(updatedProd._id)).stock;
    if (stockAfterRepeat !== stockAfterCancel) {
      throw new Error(`CRITICAL: Repeated cancellation restored stock multiple times!`);
    }
    console.log('  ✓ Safeguard verified: Stock cannot be restored more than once');

    // 8. PRODUCT MANAGEMENT (CRUD)
    console.log('\n[8] Testing Product CRUD...');
    res = await makeRequest(
      { method: 'POST', path: '/api/products' },
      {
        name: 'Test Gentle Cleanser Formulation',
        description: 'New dermatologist developed test formula',
        price: 19.99,
        category: 'Cleansers',
        stock: 50,
        image: '/uploads/hydrating-cleanser.jpg',
        isFeatured: true,
      }
    );
    if (res.status !== 201 || !res.data.product) {
      throw new Error('Admin failed to create product');
    }
    const newProduct = res.data.product;
    console.log(`  ✓ Product created: "${newProduct.name}"`);

    res = await makeRequest(
      { method: 'PUT', path: `/api/products/${newProduct._id}` },
      { price: 21.99, stock: 45 }
    );
    if (res.status !== 200 || res.data.product.price !== 21.99) {
      throw new Error('Admin failed to update product');
    }
    console.log('  ✓ Product updated successfully');

    res = await makeRequest({ method: 'DELETE', path: `/api/products/${newProduct._id}` });
    if (res.status !== 200) {
      throw new Error('Admin failed to delete product');
    }
    console.log('  ✓ Product deleted / safely deactivated');

    // 9. ADMIN CUSTOMER MANAGEMENT & SAFEGUARDS
    console.log('\n[9] Testing Customer Management & Admin Safeguards...');
    res = await makeRequest({ method: 'GET', path: '/api/users' });
    if (res.status !== 200 || !res.data.users) {
      throw new Error('Failed to list customers');
    }
    console.log(`  ✓ Customer list retrieved (${res.data.users.length} accounts)`);

    // Verify last admin cannot be deactivated
    const adminUser = await User.findOne({ role: 'admin' });
    res = await makeRequest(
      { method: 'PUT', path: `/api/users/${adminUser._id}` },
      { isActive: false }
    );
    if (res.status !== 400) {
      throw new Error(`CRITICAL: Last admin was deactivated! Expected 400, got ${res.status}`);
    }
    console.log('  ✓ Safeguard verified: Cannot deactivate last admin account');

    // 10. ACTIVITY LOGS AUDIT TRAIL
    console.log('\n[10] Testing Activity Logs Audit Trail...');
    res = await makeRequest({ method: 'GET', path: '/api/admin/activities' });
    if (res.status !== 200 || res.data.activities.length === 0) {
      throw new Error('No activity logs found');
    }
    console.log(`  ✓ Activity logs verified (${res.data.activities.length} immutable events recorded)`);

    console.log('\n=========================================');
    console.log('🎉 ALL 10 INTEGRATION TEST SUITES PASSED! 🎉');
    console.log('=========================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
