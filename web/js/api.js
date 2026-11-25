// Talks to the Python server (app.py). All network calls live here.

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok && response.headers.get("content-type")?.includes("json") === false) {
    throw new Error(`Server error (${response.status})`);
  }
  return response;
}

const jsonPost = (data) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

export async function getConfig() {
  return (await request("/api/config")).json();
}

export async function advise(profile) {
  return (await request("/api/advise", jsonPost(profile))).json();
}

export async function getChartsUrl(profile) {
  const response = await request("/api/charts", jsonPost(profile));
  if (!response.ok) throw new Error("Could not draw charts.");
  return URL.createObjectURL(await response.blob());
}

export async function getTests() {
  return (await request("/api/tests")).json();
}
