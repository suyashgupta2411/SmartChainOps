import React, { useState } from "react";

const DeployForm = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Deploying...");
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();
      if (data.error) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus(`Success: ${data.message}`);
      }
    } catch (err) {
      setStatus("An error occurred during deployment.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter GitHub Repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          required
        />
        <button type="submit">Deploy</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default DeployForm;
