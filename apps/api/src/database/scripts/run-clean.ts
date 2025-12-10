import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { cleanMockData, ensureAdminExists } from './clean-mock-data';

async function main() {
  console.log('🔌 Connecting to database...\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    // Clean mock data
    await cleanMockData(AppDataSource);

    // Ensure admin user exists
    console.log('\n👤 Checking admin user...');
    await ensureAdminExists(AppDataSource);

    console.log('\n🎉 All done!');
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
