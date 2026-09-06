async function loadBundle(paths) {
  const parts = await Promise.all(paths.map(async (path) => {
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) throw new Error(`Bundle part failed: ${path} (${response.status})`);
    return (await response.text()).trim();
  }));
  const binary = atob(parts.join(""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function utf8(bytes) {
  return new TextDecoder("utf-8").decode(bytes);
}

try {
  const [cssBytes, jsBytes] = await Promise.all([
    loadBundle(["/assets/runtime/styles-00.b64", "/assets/runtime/styles-01.b64"]),
    loadBundle(["/assets/runtime/main-00.b64", "/assets/runtime/main-01.b64", "/assets/runtime/main-02.b64"]),
  ]);

  const style = document.createElement("style");
  style.dataset.dreamscapeRuntime = "true";
  style.textContent = utf8(cssBytes);
  document.head.appendChild(style);

  const runtimeUrl = URL.createObjectURL(new Blob([utf8(jsBytes)], { type: "text/javascript" }));
  await import(runtimeUrl);
} catch (error) {
  console.error("Dreamscape Atlas startup failed", error);
  const boot = document.querySelector("#boot");
  if (boot) {
    boot.classList.add("error");
    boot.innerHTML = '<div><b>The Dream Atlas could not start.</b><span>Please refresh once. If this remains, the deployment needs repair.</span></div>';
  }
  throw error;
}
