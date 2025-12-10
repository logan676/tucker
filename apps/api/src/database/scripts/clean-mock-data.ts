import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Clean all mock/seed data from the database
 * This script preserves:
 * - Categories (base data needed for the app)
 * - Admin users
 *
 * Run with: npm run clean:mock
 */
export async function cleanMockData(dataSource: DataSource): Promise<void> {
  console.log('🧹 Starting mock data cleanup...\n');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Order matters due to foreign key constraints
    // Delete child tables first, then parent tables

    // 1. Delete notifications
    const notificationResult = await queryRunner.query('DELETE FROM notifications');
    console.log(`✓ Deleted notifications: ${notificationResult[1] || 0} rows`);

    // 2. Delete payments
    const paymentResult = await queryRunner.query('DELETE FROM payments');
    console.log(`✓ Deleted payments: ${paymentResult[1] || 0} rows`);

    // 3. Delete reviews
    const reviewResult = await queryRunner.query('DELETE FROM reviews');
    console.log(`✓ Deleted reviews: ${reviewResult[1] || 0} rows`);

    // 4. Delete order items
    const orderItemResult = await queryRunner.query('DELETE FROM order_items');
    console.log(`✓ Deleted order_items: ${orderItemResult[1] || 0} rows`);

    // 5. Delete orders
    const orderResult = await queryRunner.query('DELETE FROM orders');
    console.log(`✓ Deleted orders: ${orderResult[1] || 0} rows`);

    // 6. Delete user coupons
    const userCouponResult = await queryRunner.query('DELETE FROM user_coupons');
    console.log(`✓ Deleted user_coupons: ${userCouponResult[1] || 0} rows`);

    // 7. Delete products
    const productResult = await queryRunner.query('DELETE FROM products');
    console.log(`✓ Deleted products: ${productResult[1] || 0} rows`);

    // 8. Delete product categories
    const productCategoryResult = await queryRunner.query('DELETE FROM product_categories');
    console.log(`✓ Deleted product_categories: ${productCategoryResult[1] || 0} rows`);

    // 9. Delete application review logs (if exists)
    try {
      const appLogResult = await queryRunner.query('DELETE FROM application_review_logs');
      console.log(`✓ Deleted application_review_logs: ${appLogResult[1] || 0} rows`);
    } catch {
      console.log('⏭ Skipped application_review_logs (table may not exist)');
    }

    // 10. Delete merchant applications (if exists)
    try {
      const appResult = await queryRunner.query('DELETE FROM merchant_applications');
      console.log(`✓ Deleted merchant_applications: ${appResult[1] || 0} rows`);
    } catch {
      console.log('⏭ Skipped merchant_applications (table may not exist)');
    }

    // 11. Delete merchants
    const merchantResult = await queryRunner.query('DELETE FROM merchants');
    console.log(`✓ Deleted merchants: ${merchantResult[1] || 0} rows`);

    // 12. Delete banners
    const bannerResult = await queryRunner.query('DELETE FROM banners');
    console.log(`✓ Deleted banners: ${bannerResult[1] || 0} rows`);

    // 13. Delete coupons
    const couponResult = await queryRunner.query('DELETE FROM coupons');
    console.log(`✓ Deleted coupons: ${couponResult[1] || 0} rows`);

    // 14. Delete addresses
    const addressResult = await queryRunner.query('DELETE FROM addresses');
    console.log(`✓ Deleted addresses: ${addressResult[1] || 0} rows`);

    // 15. Delete non-admin users
    const userResult = await queryRunner.query(`
      DELETE FROM users
      WHERE role != 'admin'
    `);
    console.log(`✓ Deleted non-admin users: ${userResult[1] || 0} rows`);

    // Keep categories - they are base data
    const categoryCount = await queryRunner.query('SELECT COUNT(*) FROM categories');
    console.log(`\n📂 Preserved categories: ${categoryCount[0].count} rows`);

    // Check remaining admin users
    const adminCount = await queryRunner.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`);
    console.log(`👤 Preserved admin users: ${adminCount[0].count} rows`);

    await queryRunner.commitTransaction();
    console.log('\n✅ Mock data cleanup completed successfully!');

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('\n❌ Cleanup failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Create an admin user if none exists
 */
export async function ensureAdminExists(
  dataSource: DataSource,
  options?: {
    phone?: string;
    email?: string;
    password?: string;
  },
): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const phone = options?.phone || process.env.ADMIN_PHONE || '0400000001';
    const email = options?.email || process.env.ADMIN_EMAIL || 'admin@tucker.com.au';
    const password = options?.password || process.env.ADMIN_PASSWORD || 'Admin123!';

    // Check if admin exists
    const existing = await queryRunner.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    );

    if (existing.length > 0) {
      console.log('👤 Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user with email and password
    await queryRunner.query(`
      INSERT INTO users (id, phone, email, password, name, role, "membershipLevel", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        'Admin',
        'admin',
        0,
        NOW(),
        NOW()
      )
    `, [phone, email, hashedPassword]);

    console.log(`✅ Created admin user:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Phone: ${phone}`);

  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
