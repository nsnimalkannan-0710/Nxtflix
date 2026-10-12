import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleMovies = [
  {
    title: "Devara",
    genre: "Action",
    releaseYear: 2025,
    rating: 9.0,
    duration: "5 min",
    posterUrl: "https://picsum.photos/seed/nxtflix1/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd1/1280/500",
    overview: "Shadow Protocol is a gripping action story following unforgettable characters through a journey of tension, discovery, and consequence.",
    googleDriveFileId: "https://drive.google.com/file/d/1Kl0eOQGwXnT8Zq12aMLn6yL78T4d8HRi/view?usp=drive_link",
    isTrending: true
  },
  {
    title: "Silent Horizon",
    genre: "Drama",
    releaseYear: 2006,
    rating: 6.7,
    duration: "91 min",
    posterUrl: "https://picsum.photos/seed/nxtflix2/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd2/1280/500",
    overview: "Silent Horizon is a gripping drama story following unforgettable characters through a journey of tension and emotion.",
    googleDriveFileId: "1eFgHiJkLmNoPqRsTuVwXyZ0123456789",
    isTrending: false
  },
  {
    title: "Crimson Dawn",
    genre: "Comedy",
    releaseYear: 2007,
    rating: 7.4,
    duration: "92 min",
    posterUrl: "https://picsum.photos/seed/nxtflix3/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd3/1280/500",
    overview: "Crimson Dawn is a hilarious comedy following characters into unpredictable situations.",
    googleDriveFileId: "1fGhIjKlMnOpQrStUvWxYz01234567890",
    isTrending: true
  },
  {
    title: "Neon Streets",
    genre: "Thriller",
    releaseYear: 2008,
    rating: 8.1,
    duration: "93 min",
    posterUrl: "https://picsum.photos/seed/nxtflix4/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd4/1280/500",
    overview: "Neon Streets is a thrilling journey through urban mystery and suspense.",
    googleDriveFileId: "1gHiJkLmNoPqRsTuVwXyZ012345678901",
    isTrending: true
  },
  {
    title: "The Last Signal",
    genre: "Sci-Fi",
    releaseYear: 2009,
    rating: 8.8,
    duration: "94 min",
    posterUrl: "https://picsum.photos/seed/nxtflix5/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd5/1280/500",
    overview: "The Last Signal is a space sci-fi epic questioning human existence in deep space.",
    googleDriveFileId: "1hIjKlMnOpQrStUvWxYz0123456789012",
    isTrending: true
  },
  {
    title: "Broken Chains",
    genre: "Romance",
    releaseYear: 2010,
    rating: 9.5,
    duration: "95 min",
    posterUrl: "https://picsum.photos/seed/nxtflix6/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd6/1280/500",
    overview: "Broken Chains is a heart-rending romance story across time.",
    googleDriveFileId: "1iJkLmNoPqRsTuVwXyZ01234567890123",
    isTrending: false
  },
  {
    title: "Velvet Nights",
    genre: "Horror",
    releaseYear: 2011,
    rating: 6.2,
    duration: "96 min",
    posterUrl: "https://picsum.photos/seed/nxtflix7/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd7/1280/500",
    overview: "Velvet Nights is a terrifying horror nightmare taking place in a secluded town.",
    googleDriveFileId: "1jKlMnOpQrStUvWxYz012345678901234",
    isTrending: false
  },
  {
    title: "Iron Verdict",
    genre: "Fantasy",
    releaseYear: 2012,
    rating: 6.9,
    duration: "97 min",
    posterUrl: "https://picsum.photos/seed/nxtflix8/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd8/1280/500",
    overview: "Iron Verdict brings epic high fantasy battlegrounds and ancient magic to life.",
    googleDriveFileId: "1kLmNoPqRsTuVwXyZ0123456789012345",
    isTrending: true
  },
  {
    title: "Echoes of Tomorrow",
    genre: "Action",
    releaseYear: 2013,
    rating: 7.6,
    duration: "98 min",
    posterUrl: "https://picsum.photos/seed/nxtflix9/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd9/1280/500",
    overview: "Echoes of Tomorrow brings high stakes action and futuristic tech combat.",
    googleDriveFileId: "1lMnOpQrStUvWxYz01234567890123456",
    isTrending: false
  },
  {
    title: "Starlight Voyage",
    genre: "Sci-Fi",
    releaseYear: 2014,
    rating: 8.3,
    duration: "99 min",
    posterUrl: "https://picsum.photos/seed/nxtflix10/400/560",
    backdropUrl: "https://picsum.photos/seed/nxtflixbd10/1280/500",
    overview: "Starlight Voyage explores interstellar wormholes and distant solar systems.",
    googleDriveFileId: "1mNoPqRsTuVwXyZ012345678901234567",
    isTrending: true
  }
];

async function main() {
  console.log("Seeding database...");

  // Seed default test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminHashedPassword = await bcrypt.hash("admin123", 10);

  const testUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { passwordHash: hashedPassword, role: "USER" },
    create: {
      name: "John Doe",
      email: "user@example.com",
      passwordHash: hashedPassword,
      role: "USER",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminHashedPassword, role: "ADMIN" },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: adminHashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Created/Updated test users:", testUser.email, `(${testUser.role})`, "and", adminUser.email, `(${adminUser.role})`);

  // Seed sample movies
  for (const movieData of sampleMovies) {
    const existingMovie = await prisma.movie.findFirst({
      where: { title: movieData.title },
    });
    if (!existingMovie) {
      await prisma.movie.create({
        data: movieData,
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
