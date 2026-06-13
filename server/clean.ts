import prisma from './src/lib/prisma';

async function clean() {
  console.log('Deleting all PaperTopics...');
  await prisma.paperTopic.deleteMany();
  console.log('Deleting all Favorites...');
  await prisma.favorite.deleteMany();
  console.log('Deleting all Papers...');
  await prisma.paper.deleteMany();
  console.log('Database cleaned!');
}

clean().catch(console.error).finally(() => process.exit(0));
