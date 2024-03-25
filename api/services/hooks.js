const fetch = require("node-fetch");
const getConfig = require("../util/config");
const logger = require("../util/logger");

class Hooks {
  constructor() {
    this.hooks = {};

    this.init();
  }

  init() {
    const config = getConfig();
    if (config.organizrApiUrl && config.organizrApiKey) {
      this.addOrganizrAPI(config.organizrApiUrl, config.organizrApiKey);
    }
    logger.info(`[HOOKS] Hooks initialized`);
  }

  addHook(name, params) {
    if (!this.hooks[name]) this.hooks[name] = [];
    this.hooks[name] = this.hooks[name].filter(
      (hook) => hook.url !== params.url && hook.method !== params.method
    );
    this.hooks[name].push(params);
  }

  async runHook(name) {
    logger.info(`[HOOKS] ${name} hooks called`);

    if (this.hooks[name]) {
      try {
        await Promise.all(
          this.hooks[name].map(async (fetchParams) => {
            try {
              const { response } = await (
                await fetch(fetchParams.url, {
                  cors: "no-cors",
                  method: fetchParams.method,
                  headers: new Headers(fetchParams.headers),
                  body: fetchParams.data ? JSON.stringify(data) : undefined,
                })
              ).json();

              logger.info(`[HOOKS] ${fetchParams.url} ${response.message}`);

              if (response.result !== "success") {
                throw new Error(
                  `[${response.data.endpoint}] ${response.message}`
                );
              }
            } catch (error) {
              console.error(error);
              throw error;
            }
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  addOrganizrAPI(url, key) {
    this.addHook("usersImport", {
      url: `${url}users/import/plex`,
      method: "POST",
      headers: { Token: key, accept: "*/*" },
      data: JSON.stringify({ type: "plex" }),
    });
  }

  async testOrganizrAPI(url, key) {
    try {
      const res = await fetch(url, {
        headers: { Token: key },
        cors: "no-cors",
      });

      const organizrRes = await res.json();

      if (organizrRes.response.result === "error") {
        throw new Error(organizrRes.response.message);
      }
    } catch (error) {
      console.error(error);
      logger.error(`[HOOKS] Failed to test Organizr API: ${error.message}`);
      throw error;
    }
  }
}

const hooks = new Hooks();

module.exports = hooks;
