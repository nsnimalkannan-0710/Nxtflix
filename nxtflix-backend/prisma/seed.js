import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleMovies = [
  {
    title: "Devara",
    genre: "Action",
    releaseYear: 2024,
    rating: 9.0,
    duration: "172 min",
    posterUrl: "/posters/devara.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1280&auto=format&fit=crop&q=80",
    overview: "An epic coastal saga chronicling courage, legacy, and a fierce clash of destiny across stormy seas.",
    googleDriveFileId: "https://drive.google.com/file/d/1Kl0eOQGwXnT8Zq12aMLn6yL78T4d8HRi/view?usp=drive_link",
    isTrending: true
  },
  {
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    releaseYear: 2024,
    rating: 8.6,
    duration: "166 min",
    posterUrl: "/posters/dune2.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1280&auto=format&fit=crop&q=80",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    googleDriveFileId: "1eFgHiJkLmNoPqRsTuVwXyZ0123456789",
    isTrending: true
  },
  {
    title: "Oppenheimer",
    genre: "Drama",
    releaseYear: 2023,
    rating: 8.9,
    duration: "180 min",
    posterUrl: "/posters/oppenheimer.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1280&auto=format&fit=crop&q=80",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    googleDriveFileId: "1fGhIjKlMnOpQrStUvWxYz01234567890",
    isTrending: true
  },
  {
    title: "Deadpool & Wolverine",
    genre: "Comedy",
    releaseYear: 2024,
    rating: 7.8,
    duration: "128 min",
    posterUrl: "/posters/deadpool.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&auto=format&fit=crop&q=80",
    overview: "A listless Wade Wilson toils away in civilian life when the TVA pulls him into a new mission alongside a reluctant Wolverine.",
    googleDriveFileId: "1gHiJkLmNoPqRsTuVwXyZ012345678901",
    isTrending: true
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    releaseYear: 2024,
    rating: 8.7,
    duration: "169 min",
    posterUrl: "/posters/interstellar.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80",
    overview: "A team of intrepid explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    googleDriveFileId: "1hIjKlMnOpQrStUvWxYz0123456789012",
    isTrending: true
  },
  {
    title: "The Batman",
    genre: "Thriller",
    releaseYear: 2022,
    rating: 7.9,
    duration: "176 min",
    posterUrl: "/posters/batman.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1280&auto=format&fit=crop&q=80",
    overview: "In his second year of fighting crime, Batman uncovers corruption in Gotham City connected to his own family while facing the Riddler.",
    googleDriveFileId: "1iJkLmNoPqRsTuVwXyZ01234567890123",
    isTrending: false
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    genre: "Action",
    releaseYear: 2023,
    rating: 8.6,
    duration: "140 min",
    posterUrl: "/posters/spiderman.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1280&auto=format&fit=crop&q=80",
    overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    googleDriveFileId: "1jKlMnOpQrStUvWxYz012345678901234",
    isTrending: false
  },
  {
    title: "Leo",
    genre: "Action",
    releaseYear: 2023,
    rating: 7.3,
    duration: "164 min",
    posterUrl: "/posters/leo.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80",
    overview: "A gentle cafe owner in Kashmir is targeted by dangerous cartel operatives who claim he is actually a ruthless gangster named Leo Das.",
    googleDriveFileId: "1kLmNoPqRsTuVwXyZ0123456789012345",
    isTrending: true
  },
  {
    title: "Inception",
    genre: "Thriller",
    releaseYear: 2021,
    rating: 8.8,
    duration: "148 min",
    posterUrl: "/posters/inception.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&auto=format&fit=crop&q=80",
    overview: "A skilled thief who steals corporate secrets through dream-sharing technology is offered a chance to have his criminal history erased.",
    googleDriveFileId: "1lMnOpQrStUvWxYz01234567890123456",
    isTrending: false
  },
  {
    title: "Salaar: Part 1 – Ceasefire",
    genre: "Action",
    releaseYear: 2023,
    rating: 7.1,
    duration: "175 min",
    posterUrl: "/posters/salaar.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80",
    overview: "A fierce warrior honors a bond of loyalty to his childhood friend amidst power struggles in the ruthless fortress city of Khansaar.",
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
    if (existingMovie) {
      await prisma.movie.update({
        where: { id: existingMovie.id },
        data: movieData,
      });
    } else {
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
