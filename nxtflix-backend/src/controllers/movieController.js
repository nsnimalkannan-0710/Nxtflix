import prisma from "../config/db.js";
import drive from "../config/googleDrive.js";

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

export async function getMovies(req, res, next) {
  try {
    const { genre, search } = req.query;

    const where = {};

    if (genre && genre !== "All") {
      where.genre = {
        equals: genre,
        mode: "insensitive",
      };
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      total: movies.length,
      movies: movies.map(formatMovie),
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrendingMovies(req, res, next) {
  try {
    const movies = await prisma.movie.findMany({
      where: { isTrending: true },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      total: movies.length,
      movies: movies.map(formatMovie),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMovieById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.status(200).json({
      success: true,
      movie: formatMovie(movie),
    });
  } catch (error) {
    next(error);
  }
}

export async function streamMovie(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!movie || !movie.googleDriveFileId) {
      return res.status(404).json({ message: "Movie video file not found" });
    }

    if (!drive) {
      return res.status(503).json({
        message: "Google Drive service is not configured. Please add service-account.json.",
      });
    }

    const fileId = movie.googleDriveFileId;
    const range = req.headers.range;

    const fileMetaData = await drive.files.get({
      fileId,
      fields: "size, mimeType",
    });

    const fileSize = parseInt(fileMetaData.data.size, 10);
    const mimeType = fileMetaData.data.mimeType || "video/mp4";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": mimeType,
      });

      const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream", headers: { Range: `bytes=${start}-${end}` } }
      );
      response.data.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": mimeType,
      });

      const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );
      response.data.pipe(res);
    }
  } catch (error) {
    console.error("Streaming error:", error);
    next(error);
  }
}
