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

  async runHook(name, value) {
    logger.info(`[HOOKS] ${name} hooks called`);

    if (this.hooks[name]) {
      try {
        await Promise.all(
          this.hooks[name].map(async (fetchParams) => {
            try {
              if (typeof fetchParams === "function") {
                fetchParams = await fetchParams(value);
              }

              const fetchResonse = await fetch(fetchParams.url, {
                cors: "no-cors",
                method: fetchParams.method,
                headers: new Headers(fetchParams.headers),
                body: fetchParams.data ? JSON.stringify(data) : undefined,
              });

              if (fetchParams.method === "DELETE") {
                logger.info(`[HOOKS] ${fetchParams.url} well deleted`);
                return;
              }

              const { response } = await fetchResonse.json();

              if (response.result !== "success") {
                logger.error(`[HOOKS] ${fetchParams.url} ${response.message}`);
                throw new Error(
                  `[${response.data.endpoint}] ${response.message}`
                );
              }
              logger.info(`[HOOKS] ${fetchParams.url} ${response.message}`);
            } catch (error) {
              throw error;
            }
          })
        );
      } catch (error) {
        throw error;
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

    this.addHook("deleteUser", async (user) => {
      const organizrUsers = await fetch(`${url}users`, {
        headers: { Token: key },
      });
      const { response } = await organizrUsers.json();
      const organizrUser = response.data.find(
        (organizrUser) => organizrUser.email === user.email
      );

      if (!organizrUser) {
        throw new Error("User not found in Organizr");
      }

      return {
        url: `${url}users/${organizrUser.id}`,
        method: "DELETE",
        headers: { Token: key, accept: "*/*" },
      };
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
