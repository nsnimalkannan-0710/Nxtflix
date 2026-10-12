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
      // Demo streaming fallback: redirect to sample test video if Google Drive is not configured yet
      return res.redirect("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    }

    let fileId = movie.googleDriveFileId;
    if (fileId.includes("/d/")) {
      const match = fileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        fileId = match[1];
      }
    }

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

export async function createMovie(req, res, next) {
  try {
    const {
      title,
      genre,
      year,
      releaseYear,
      rating,
      duration,
      poster,
      posterUrl,
      backdrop,
      backdropUrl,
      overview,
      googleDriveFileId,
      isTrending,
    } = req.body;

    if (!title || !genre) {
      return res.status(400).json({ message: "Title and genre are required" });
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        genre,
        releaseYear: parseInt(year || releaseYear || new Date().getFullYear(), 10),
        rating: parseFloat(rating || 0.0),
        duration: duration || "120 min",
        posterUrl: poster || posterUrl || "https://picsum.photos/seed/nxtflix/400/560",
        backdropUrl: backdrop || backdropUrl || "https://picsum.photos/seed/nxtflixbd/1280/500",
        overview: overview || "",
        googleDriveFileId: googleDriveFileId || "1eFgHiJkLmNoPqRsTuVwXyZ0123456789",
        isTrending: Boolean(isTrending),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie: formatMovie(movie),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMovie(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const {
      title,
      genre,
      year,
      releaseYear,
      rating,
      duration,
      poster,
      posterUrl,
      backdrop,
      backdropUrl,
      overview,
      googleDriveFileId,
      isTrending,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (genre !== undefined) data.genre = genre;
    if (year !== undefined || releaseYear !== undefined) {
      data.releaseYear = parseInt(year || releaseYear, 10);
    }
    if (rating !== undefined) data.rating = parseFloat(rating);
    if (duration !== undefined) data.duration = duration;
    if (poster !== undefined || posterUrl !== undefined) {
      data.posterUrl = poster || posterUrl;
    }
    if (backdrop !== undefined || backdropUrl !== undefined) {
      data.backdropUrl = backdrop || backdropUrl;
    }
    if (overview !== undefined) data.overview = overview;
    if (googleDriveFileId !== undefined) data.googleDriveFileId = googleDriveFileId;
    if (isTrending !== undefined) data.isTrending = Boolean(isTrending);

    const movie = await prisma.movie.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie: formatMovie(movie),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMovie(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    await prisma.movie.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

