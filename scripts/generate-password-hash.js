const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Get password from environment variable
const PASSWORD = process.env.PROTECTED_PAGE_PASSWORD;

if (!PASSWORD) {
    console.error('PROTECTED_PAGE_PASSWORD environment variable not found in .env.local');
    console.log('Please make sure .env.local contains: PROTECTED_PAGE_PASSWORD=your_password');
    process.exit(1);
}

console.log('Password from environment:', PASSWORD);

async function generateHash() {
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(PASSWORD, saltRounds);
        console.log('\nGenerated Hash:', hash);
        console.log('\nTo use bcrypt hashing instead of plain text comparison:');
        console.log('1. Copy the hash above');
        console.log('2. Update src/app/actions/auth.js to use bcrypt.compare()');
        console.log('3. Store the hash in your .env file as PROTECTED_PAGE_PASSWORD_HASH');
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

generateHash();
