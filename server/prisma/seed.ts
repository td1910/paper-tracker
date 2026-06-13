import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const topics = [
  {
    name: 'Artificial Intelligence',
    keywords: 'artificial intelligence, AI agents, reasoning, planning',
    description: 'AI systems, agents, reasoning and planning',
  },
  {
    name: 'Machine Learning',
    keywords: 'machine learning, deep learning, neural networks, optimization',
    description: 'ML models, training methods and optimization',
  },
  {
    name: 'Natural Language Processing',
    keywords: 'natural language processing, large language models, transformers, text generation',
    description: 'LLMs, transformers and text understanding',
  },
  {
    name: 'Computer Vision',
    keywords: 'computer vision, image recognition, object detection, segmentation',
    description: 'Image and video understanding',
  },
  {
    name: 'Reinforcement Learning',
    keywords: 'reinforcement learning, reward learning, policy optimization, Q-learning',
    description: 'RL agents, reward design and policy methods',
  },
  {
    name: 'Quantum Computing',
    keywords: 'quantum computing, quantum algorithms, quantum circuits, qubits',
    description: 'Quantum algorithms and hardware',
  },
  {
    name: 'Robotics',
    keywords: 'robotics, robot learning, manipulation, locomotion',
    description: 'Robot learning, control and manipulation',
  },
  {
    name: 'Multimodal AI',
    keywords: 'multimodal, vision language model, image text, VLM',
    description: 'Models combining vision, language and other modalities',
  },
  {
    name: 'Finance & Trading',
    keywords: 'stock prediction, algorithmic trading, quantitative finance, market prediction',
    description: 'Financial forecasting and quantitative methods',
  },
];

async function main() {
  console.log('Seeding topics...');
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: { keywords: topic.keywords, description: topic.description },
      create: topic,
    });
  }
  console.log(`Seeded ${topics.length} topics.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
