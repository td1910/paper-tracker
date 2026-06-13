import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding dummy users and favorites...');

  // Create 10 dummy users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `dummy${i}@example.com` },
      update: {},
      create: {
        email: `dummy${i}@example.com`,
        passwordHash: 'dummy_hash',
      },
    });
    users.push(user);
  }

  console.log(`Created ${users.length} dummy users.`);

  // Get all papers
  const papers = await prisma.paper.findMany();
  if (papers.length === 0) {
    console.log('No papers found to favorite. Please fetch papers first.');
    return;
  }

  // Randomly assign favorites (skewed so some papers get many favorites)
  let favoriteCount = 0;
  for (const paper of papers) {
    // 30% chance a paper becomes "viral", otherwise it gets 0-2 favorites
    const isViral = Math.random() > 0.7;
    const numFavorites = isViral ? Math.floor(Math.random() * 8) + 3 : Math.floor(Math.random() * 3);

    // Shuffle users
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const favoritingUsers = shuffledUsers.slice(0, numFavorites);

    for (const user of favoritingUsers) {
      try {
        await prisma.favorite.create({
          data: {
            fkUserId: user.id,
            fkPaperId: paper.id,
          },
        });
        favoriteCount++;
      } catch (e) {
        // Ignore unique constraint violations if they already favorited it
      }
    }
  }

  console.log(`Created ${favoriteCount} dummy favorites across ${papers.length} papers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
