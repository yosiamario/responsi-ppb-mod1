/**
 * Middleware untuk menangani error secara terpusat.
 */
function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan pada server";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

/**
 * Middleware untuk menangani route yang tidak ditemukan.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

module.exports = { errorHandler, notFoundHandler };
