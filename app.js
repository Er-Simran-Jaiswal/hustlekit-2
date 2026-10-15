const $ = (id) => document.getElementById(id);
const form = $("listingForm");
const details = $("details");
const charCount = $("charCount");
const dialog = $("helpDialog");
let localModel = "";
let busy = false;

details.addEventListener("input", () => charCount.textContent = `${details.value.length} / 1200`);
$("helpButton").addEventListener("click", () => dialog.showModal());
$("closeHelp").addEventListener("click", () => dialog.close());
$("connectButton").addEventListener("click", async () => {
  const chosen = $("modelName").value.trim() || "llama3.2";
  const btn = $("connectButton");
  btn.disabled = true; btn.textContent = "Checking local model…";
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    if (!response.ok) throw new Error("Ollama did not respond");
    const data = await response.json();
    const models = (data.models || []).map(m => m.name);
    const match = models.find(m => m === chosen || m.startsWith(chosen + ":"));
    if (!match) throw new Error(`Model "${chosen}" was not found. Run: ollama pull ${chosen}`);
    localModel = match;
    $("modeBadge").innerHTML = "<i></i> Local model connected";
    $("modeBadge").classList.add("local");
    dialog.close();
    toast(`Connected to ${match}`);
  } catch (error) {
    toast(error.message.includes("Failed to fetch") ? "Can't reach Ollama. Check it's running and allow this page in OLLAMA_ORIGINS." : error.message);
  } finally {
    btn.disabled = false; btn.textContent = "Connect local model ↗";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  const data = {
    name: $("productName").value.trim(),
    category: $("category").value,
    platform: $("platform").value,
    details: details.value.trim(),
    tone: $("tone").value,
    audience: $("audience").value.trim() || "people looking for a thoughtful, useful purchase"
  };
  if (!data.name || !data.details) return;
  setBusy(true);
  try {
    let listing;
    if (localModel) {
      listing = await generateWithOllama(data);
      $("modeBadge").innerHTML = "<i></i> Generated locally";
      $("modeBadge").classList.add("local");
    } else {
      listing = generateDemo(data);
      $("modeBadge").innerHTML = "<i></i> Demo mode";
      $("modeBadge").classList.remove("local");
    }
    renderListing(listing);
    toast(localModel ? "Listing generated on your device." : "Demo listing ready. Connect Ollama for open-model AI.");
  } catch (error) {
    toast(`Local generation failed: ${error.message}`);
  } finally { setBusy(false); }
});

$("regenerateButton").addEventListener("click", () => form.requestSubmit());

async function generateWithOllama(data) {
  const prompt = `You are a practical ecommerce copywriter helping a small independent seller. Create an honest, search-friendly product listing using only facts supplied. Never invent materials, dimensions, certifications, shipping promises, or performance claims. If a detail is missing, omit it. Keep tone: ${data.tone}. Target customer: ${data.audience}. Platform: ${data.platform}. Category: ${data.category}. Product name: ${data.name}. Product details: ${data.details}

Return ONLY valid JSON with this exact shape:
{"title":"max 140 characters","description":"2 short paragraphs, then a concise call to action","tags":["13 tags, each ideally 1-3 words"]}`;
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: localModel, prompt, stream: false, format: "json", options: { temperature: 0.65 } })
  });
  if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
  const payload = await response.json();
  const parsed = JSON.parse(payload.response);
  if (!parsed.title || !parsed.description || !Array.isArray(parsed.tags)) throw new Error("Model returned an unexpected format. Try generating again.");
  return { title: String(parsed.title), description: String(parsed.description), tags: parsed.tags.map(String).slice(0, 15) };
}

// Transparent offline demo: deterministic templates, not a language model.
function generateDemo(d) {
  const clean = d.name.replace(/[.!?]+$/, "");
  const details = d.details.replace(/\s+/g, " ").trim();
  const toneOpeners = {
    "Warm & friendly": `Meet ${clean} — a little something made to bring more joy to your day.`,
    "Minimal & modern": `${clean}: thoughtfully chosen details, made simple.`,
    "Playful & bold": `Say hello to ${clean}! Your new favourite might have just arrived.`,
    "Premium & elegant": `Discover ${clean}, a considered addition for those who appreciate the details.`,
    "Clear & practical": `${clean} is a practical choice for ${d.audience}.`
  };
  const title = `${clean} | ${d.category.split(" & ")[0]} Gift Idea`.slice(0, 140);
  const description = `${toneOpeners[d.tone] || toneOpeners["Warm & friendly"]}\n\n${details}\n\nA thoughtful pick for ${d.audience}. Explore the details, choose what suits you, and make it part of your everyday.`;
  const words = `${clean} ${d.category} ${d.platform} ${details} gift handmade unique thoughtful`.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(w => w.length > 2);
  const tags = [...new Set([clean, d.category, "gift idea", "small business", "thoughtful gift", ...words.slice(0, 10)])]
    .map(s => s.trim()).filter(Boolean).slice(0, 13);
  return { title, description, tags };
}

function renderListing(listing) {
  $("emptyState").classList.add("hidden");
  $("results").classList.remove("hidden");
  $("resultTitle").textContent = listing.title;
  $("resultDescription").textContent = listing.description;
  const tagWrap = $("resultTags");
  tagWrap.replaceChildren();
  listing.tags.forEach(tag => {
    const el = document.createElement("span");
    el.className = "tag"; el.textContent = String(tag).replace(/^#/, "");
    tagWrap.appendChild(el);
  });
  // Store plain tag text for the copy controls.
  tagWrap.dataset.copyValue = listing.tags.map(t => String(t).replace(/^#/, "")).join(", ");
  $("results").dataset.ready = "true";
}

document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
  const target = $(button.dataset.copy);
  const value = target.dataset.copyValue || target.textContent;
  try {
    await navigator.clipboard.writeText(value);
    const original = button.textContent;
    button.textContent = "Copied ✓";
    setTimeout(() => button.textContent = original, 1200);
    toast("Copied to clipboard.");
  } catch {
    const range = document.createRange(); range.selectNodeContents(target);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    toast("Text selected. Press Cmd+C or Ctrl+C to copy.");
  }
}));

function setBusy(value) {
  busy = value;
  const button = $("generateButton");
  button.disabled = value;
  button.innerHTML = value ? "✳ Working on your listing…" : '<span>✳</span> Generate my listing <span class="button-arrow">↗</span>';
}
let toastTimer;
function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}
