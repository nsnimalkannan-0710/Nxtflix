import prisma from "../config/db.js";

function formatMovie(movie) {
  if (!movie) return null;
  return {
    id: movie.id,
    title: movie.title,
    genre: movie.genre,
    year: movie.releaseYear,
    rating: movie.rating ? movie.rating.toString() : "0.0",
    duration: movie.duration,
    poster: movie.posterUrl,
    backdrop: movie.backdropUrl,
    overview: movie.overview,
    googleDriveFileId: movie.googleDriveFileId,
    isTrending: movie.isTrending,
  };
}

export async function getWatchLaterList(req, res, next) {
  try {
    const userId = req.user.id;

    const watchLaterItems = await prisma.watchLater.findMany({
      where: { userId },
      include: {
        movie: true,
      },
      orderBy: { addedAt: "desc" },
    });

    const movies = watchLaterItems.map((item) => formatMovie(item.movie));

    return res.status(200).json({
      success: true,
      total: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
}

export async function addToWatchLater(req, res, next) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const existing = await prisma.watchLater.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Movie is already in Watch Later list",
      });
    }

    await prisma.watchLater.create({
      data: {
        userId,
        movieId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Movie added to Watch Later list",
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWatchLater(req, res, next) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    await prisma.watchLater.deleteMany({
      where: {
        userId,
        movieId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Movie removed from Watch Later list",
    });
  } catch (error) {
    next(error);
  }
}
