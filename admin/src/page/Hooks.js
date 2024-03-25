import React, { useEffect, useState } from "react";
import * as api from "../data/Api/api";

export function Hooks(props) {
  const { msg } = props;

  const [organizr, setOrganizr] = useState({ apiKey: "", apiUrl: "" });
  const [organizrEdit, setOrganizrEdit] = useState({ apiKey: "", apiUrl: "" });

  async function getAPIsHooks() {
    try {
      const { organizrApiKey, organizrApiUrl } = await api.getAPIsHooks();

      console.log({ organizrApiKey, organizrApiUrl });

      setOrganizr({ apiKey: organizrApiKey, apiUrl: organizrApiUrl });
      setOrganizrEdit({ apiKey: organizrApiKey, apiUrl: organizrApiUrl });
    } catch (error) {
      console.error(error);
      msg({
        message: error.message,
        type: error.level,
      });
    }
  }

  async function updateAPIsHooks() {
    try {
      await api.updateAPIsHooks({
        organizrApiKey: organizrEdit.apiKey,
        organizrApiUrl: organizrEdit.apiUrl,
      });
      setOrganizr({ apiKey: organizrEdit.apiKey, apiUrl: organizrEdit.apiUrl });
      setOrganizrEdit({
        apiKey: organizrEdit.apiKey,
        apiUrl: organizrEdit.apiUrl,
      });
      msg({
        message: "API hooks updated",
        type: "success",
      });
    } catch (error) {
      setOrganizrEdit({
        apiKey: organizr.apiKey,
        apiUrl: organizr.apiUrl,
      });
      msg({
        message: error.message,
        type: error.level,
      });
    }
  }

  useEffect(() => {
    getAPIsHooks();
  }, []);

  return (
    <>
      <section>
        <h1 className="title-btn">
          <p className="main-title">Hooks</p>
        </h1>
      </section>

      <div>
        <h3 className="sub-title">Organizr API</h3>
        <form onSubmit={updateAPIsHooks}>
          <div className="input-button-group">
            <input
              id="urlRedirection"
              placeholder="Organizr API URL ex. http://192.168.0.1:80/api/v2"
              style={{ width: "400px" }}
              className="styled-input--input"
              value={organizrEdit.apiUrl}
              onChange={(e) =>
                setOrganizrEdit({ ...organizrEdit, apiUrl: e.target.value })
              }
            />
            <input
              value={organizrEdit.apiKey}
              style={{ width: "200px" }}
              className="styled-input--input"
              placeholder="Organizr API Key"
              onChange={(e) =>
                setOrganizrEdit({ ...organizrEdit, apiKey: e.target.value })
              }
            />
            <button className="btn btn__square" type="submit">
              ✔
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
