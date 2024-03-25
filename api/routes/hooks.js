const express = require("express");
const getConfig = require("../util/config");
const updateConfig = require("../util/updateConfig");
const hooks = require("../services/hooks");

const hooksRouter = express.Router();

hooksRouter.get("/", (req, res) => {
  const { organizrApiKey, organizrApiUrl } = getConfig();

  try {
    res.status(200).json({ organizrApiKey, organizrApiUrl });
  } catch (err) {
    res.status(500).json({ level: "error", message: "Failed to get hooks" });
    return;
  }
});

hooksRouter.post("/", async (req, res) => {
  if (req.body.organizrApiUrl && req.body.organizrApiKey) {
    req.body.organizrApiUrl = req.body.organizrApiUrl.endsWith("/")
      ? req.body.organizrApiUrl
      : `${req.body.organizrApiUrl}/`;

    try {
      await hooks.testOrganizrAPI(
        req.body.organizrApiUrl,
        req.body.organizrApiKey
      );
    } catch (error) {
      res.status(404).json({
        level: "error",
        message: error.message,
      });
      return;
    }
  }

  try {
    Object.keys(req.body).forEach((key) => {
      updateConfig(key, req.body[key]);
    });

    res.status(200).json(req.body);

    hooks.addOrganizrAPI(req.body.organizrApiUrl, req.body.organizrApiKey);
  } catch (err) {
    res.status(500).json({ level: "error", message: "Failed to update hooks" });
    return;
  }
});

module.exports = {
  hooksRouter,
};
