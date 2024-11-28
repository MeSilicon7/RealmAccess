import { execSync } from 'child_process';
import * as fs from 'fs';
import * as readline from 'readline';

const DATABASE_NAME = 'test_prisma';
const PRISMA_SCHEMA = './prisma/schema.prisma';
const MIGRATIONS_DIR = './migrations';

const execCommand = (command: string) => {
    try {
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        process.exit(1);
    }
};

const main = async () => {
    console.log('Starting migration process...');

    // Prompt for migration name
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const migrationName = await new Promise<string>((resolve) => {
        rl.question('Enter migration name (e.g., create_user_table): ', (answer) => {
            resolve(answer);
            rl.close();
        });
    });

    // Create migration file
    execCommand(`bunx wrangler d1 migrations create ${DATABASE_NAME} ${migrationName}`);

    // Determine the latest migration file
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR);
    const latestMigrationFile = migrationFiles.sort().pop();
    if (!latestMigrationFile) {
        console.error('No migration file found.');
        process.exit(1);
    }

    // Determine if it's the initial migration
    const fromFlag = migrationFiles.length === 1 ? '--from-empty' : '--from-local-d1';

    // Generate SQL for migration
    execCommand(
        `bunx prisma migrate diff ${fromFlag} --to-schema-datamodel ${PRISMA_SCHEMA} --script --output ${MIGRATIONS_DIR}/${latestMigrationFile}`
    );

    // Apply migration locally and remotely
    execCommand(`bunx wrangler d1 migrations apply ${DATABASE_NAME} --local`);
    // execCommand(`bunx wrangler d1 migrations apply ${DATABASE_NAME} --remote`);

    console.log('Migration process completed successfully.');
};

main();
