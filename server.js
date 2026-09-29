app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(root, "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Portfolio running at http://localhost:${PORT}`);
  });
}

module.exports = app;