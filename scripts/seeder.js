const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RestaurantProfile = require('../models/RestaurantProfile');

const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'System Admin',
        email: 'admin@foodcourt.com',
        password: hashedPassword,
        role: 'Admin'
      });
      console.log('Admin seeded');
    }

    for (let i = 1; i <= 4; i++) {
        const email = `rest${i}@food.com`;
        const restExists = await User.findOne({ email });
        if (!restExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            const newRest = await User.create({
                name: `Restaurant ${i}`,
                email,
                password: hashedPassword,
                role: 'Restaurant'
            });

            await RestaurantProfile.create({
                user_id: newRest._id,
                name: `Restaurant ${i}`,
                bio: `Welcome to Restaurant ${i}`,
                description: 'A great place to eat.',
                location: 'Food Court Plaza',
                tables: [
                    { tableNumber: 'T1', capacity: 4 },
                    { tableNumber: 'T2', capacity: 2 }
                ],
                categories: ['Mains', 'Desserts', 'Beverages']
            });
            console.log(`Restaurant ${i} seeded`);
        }
    }
  } catch (error) {
    console.error('Seeding error', error);
  }
};

module.exports = seedUsers;
