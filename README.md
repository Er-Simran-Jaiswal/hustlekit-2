# HustleKit — Local Listing Studio

**A small-business side-hustle tool:** turn product details into ecommerce listing copy, titles, and search tags.

HustleKit is built with plain HTML, CSS, and JavaScript. It works immediately in transparent demo mode, and can connect to an open-weight model running locally through [Ollama](https://ollama.com/). In local-model mode, product details are sent to your local Ollama service—not to a hosted AI API.

## Features

- Responsive dashboard-style interface
- Product title, description, and search-tag generation
- Tone, audience, category, and platform options
- One-click copy controls
- Local open-model connection through Ollama
- Offline demo mode that does not pretend to be AI
- Clear reminder to verify product claims before publishing

## Run it

### 1. Open the project

Unzip the project folder.

### 2. Start the page from a local web server

Using VS Code, install/enable **Live Server**, right-click `index.html`, and choose **Open with Live Server**. Or use Python from this folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

### 3. Try demo mode

Enter a product name and some details, then click **Generate my listing**. Demo mode uses templates and simple keyword extraction; it is for trying the interface, not a real model response.

### 4. Connect an open-weight model

Install Ollama from https://ollama.com/ and run this in Terminal:

```bash
ollama pull llama3.2
ollama run llama3.2
```

Keep Ollama running. In HustleKit, click the `?` button, confirm the model name (`llama3.2`), and choose **Connect local model**.

The app uses Ollama's local API at `http://localhost:11434`. Browser security may block requests from your development server unless Ollama allows that origin. If so, configure `OLLAMA_ORIGINS` for the local origin you are using and restart Ollama. For example, use the exact origin shown in your browser address bar, such as `http://localhost:5500` or `http://localhost:8000`. Consult Ollama's current documentation for platform-specific environment-variable instructions.

**Privacy note:** once connected, generation runs on the local model. Do not use demo mode as evidence of AI inference. No hosted model API or API key is included in this project.

## Tech stack

- HTML5 for structure
- CSS3 for responsive layout and visual design
- Vanilla JavaScript for form state, rendering, clipboard actions, and local API calls
- Ollama local API for open-weight model inference (optional connection)

## Why open innovation matters

- **Privacy:** product drafts can remain on the seller's computer when using a local model.
- **Cost control:** no per-request hosted AI API bill; local hardware and electricity still have costs.
- **Choice:** model names can be changed in the connection dialog to try another model installed in Ollama.
- **Less lock-in:** the app calls a documented local HTTP endpoint rather than depending on a proprietary AI platform.
- **Transparency:** demo mode is explicitly labeled and does not claim to be AI.

A hosted closed model may produce stronger results on some prompts, and a local model uses device resources. This project values user control and privacy over assuming one model is best for every seller.

## Suggested next steps

1. Test with a real seller and record what they would pay for.
2. Add a downloadable listing export.
3. Add presets for Etsy, eBay, and Shopify character limits.
4. Let sellers save reusable brand voice guidelines locally.
5. Add optional local image captioning through an open vision model.

## Important

Generated copy can contain mistakes. Sellers should check every factual claim, measurement, and policy before publishing.
