import prisma from "../config/db.js";

export async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { watchLater: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { role } = req.body;
    if (!role || !["USER", "ADMIN"].includes(role.toUpperCase())) {
      return res.status(400).json({ message: "Role must be 'USER' or 'ADMIN'" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminAnalytics(req, res, next) {
  try {
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const userCount = await prisma.user.count({ where: { role: "USER" } });

    const totalMovies = await prisma.movie.count();
    const trendingMoviesCount = await prisma.movie.count({ where: { isTrending: true } });

    // Movies grouped by genre
    const genresData = await prisma.movie.groupBy({
      by: ["genre"],
      _count: { id: true },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        adminCount,
        userCount,
        totalMovies,
        trendingMoviesCount,
        genres: genresData.map((g) => ({ genre: g.genre, count: g._count.id })),
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
}
