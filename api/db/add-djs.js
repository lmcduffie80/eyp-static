// Script to add Lee McDuffie and Misty McDuffie as DJ users
import sql from './connection.js';
import { hashPassword } from '../utils/password.js';

async function addDJs() {
    try {
        console.log('Adding DJ users...');
        
        // Default password for new DJs (should be changed after first login)
        const defaultPassword = 'TempPassword123!';
        const hashedPassword = await hashPassword(defaultPassword);
        
        const djsToAdd = [
            {
                username: 'lee',
                email: 'lee.mcduffie@externallyyoursproductions.com', // Update with actual email if different
                firstName: 'Lee',
                lastName: 'McDuffie',
                phone: null, // Add phone number if available
                userType: 'dj'
            },
            {
                username: 'misty',
                email: 'misty.mcduffie@externallyyoursproductions.com', // Update with actual email if different
                firstName: 'Misty',
                lastName: 'McDuffie',
                phone: null, // Add phone number if available
                userType: 'dj'
            }
        ];
        
        for (const dj of djsToAdd) {
            // Check if user already exists
            const existing = await sql`
                SELECT id FROM users WHERE username = ${dj.username} OR email = ${dj.email}
            `;
            
            if (existing.rows.length > 0) {
                console.log(`DJ ${dj.firstName} ${dj.lastName} (${dj.username}) already exists. Skipping...`);
                continue;
            }
            
            // Insert the DJ user
            const result = await sql`
                INSERT INTO users (
                    username, email, password, first_name, last_name, phone,
                    user_type, is_super_user, profile_picture
                ) VALUES (
                    ${dj.username}, ${dj.email}, ${hashedPassword}, ${dj.firstName}, ${dj.lastName},
                    ${dj.phone}, ${dj.userType}, false, null
                ) RETURNING id, username, first_name, last_name, email
            `;
            
            const newUser = result.rows[0];
            console.log(`✅ Successfully added DJ: ${newUser.first_name} ${newUser.last_name} (${newUser.username})`);
            console.log(`   Email: ${newUser.email}`);
            console.log(`   Default password: ${defaultPassword}`);
            console.log(`   ⚠️  Please change the password after first login!`);
        }
        
        console.log('\n✅ DJ import completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding DJs:', error);
        process.exit(1);
    }
}

// Run the script
addDJs();

