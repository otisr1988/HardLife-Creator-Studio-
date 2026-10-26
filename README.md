# HardLife Creator Studio

> **Private AI Video Production, Multi-Track Editing, Social Scheduling & ChatGPT MCP Server**

HardLife Creator Studio is an enterprise-grade, single-owner private web application and video production engine. It combines the capabilities of vidIQ, CapCut, and social scheduling software into a single unified workspace built specifically for creator accounts:
- **YouTube:** `@towboater2011`
- **TikTok:** `@otis0239`

---

## 🌟 Key Highlights & System Architecture

1. **Single-Owner Security Architecture:**
   - Enforced for owner: `kodir1988@gmail.com`.
   - Built on Firebase Authentication (Google Sign-In) and Zero-Trust ABAC Firestore Security Rules (`firestore.rules`).
   - Server-side credential protection with immutable audit activity logging.

2. **Official Model Context Protocol (MCP) Server for ChatGPT:**
   - Remotely accessible authenticated endpoint at `/api/mcp` and `/mcp` supporting JSON-RPC 2.0.
   - Implements all 16 core video production and publishing tools:
     - `list_projects`
     - `get_connected_accounts`
     - `get_video_analytics`
     - `upload_source_video`
     - `analyze_video`
     - `transcribe_video`
     - `create_video_project`
     - `generate_short`
     - `edit_video`
     - `render_video`
     - `get_render_status`
     - `create_video_metadata`
     - `schedule_video`
     - `publish_video`
     - `get_publication_status`
     - `list_content_calendar`
   - Configurable Approval Mode: **Review Before Publishing** (default) vs. **Automatic Publishing Under Standing Authorization**.
   - Mandatory human approval for high-risk operations (deleting videos, changing credentials).

3. **Real Server-Side FFmpeg Video Rendering Worker:**
   - Powered by system binary `/usr/bin/ffmpeg`.
   - Real multi-track assembly, video scaling/letterboxing, burned subtitles, audio normalization, and poster thumbnails.
   - Export presets for YouTube Shorts (1080×1920), TikTok (1080×1920), YouTube Long-form (1920×1080), and Square (1080×1080).

4. **AI Video Production Pipeline:**
   - 8-phase generation engine: Research & fact verification → Guardrail check → Original script & storyboard → Speech synthesis → Safe-zone caption positioning → Call-to-action → Technical review → Packaging.
   - Specialized niche guardrails:
     - **GTA V & GTA VI:** Recreations and speculative physics are strictly flagged as simulated demonstrations.
     - **Towboats & River Operations:** Authentic horsepower specifications (6,000 to 10,500 HP), Mississippi river flanking mechanics, and lock operations.
     - **Tarot Readings:** Creator voice cadence preserved, pauses trimmed, cards clearly framed.
     - **Comedy & Viral Facts:** High-retention opening hooks (0-3s).

5. **Transparent Cost Estimator:**
   - Free self-hosted compute ($0.00 FFmpeg rendering, $0.00 local speech synthesis) separated from optional paid model tokens.
   - Enforces a monthly spending cap with real-time budget tracking.

6. **Automated Content Production Scheduler:**
   - Persistent server-side daemon executing queued renders and scheduled releases.
   - Topic pool deduplication preventing repetitive concepts or accidental reposts.

---

## 🔌 Connecting HardLife MCP Server to ChatGPT

1. In ChatGPT, navigate to **Explore GPTs** → **Create a GPT** (or your Custom Action configuration).
2. Under **Actions**, click **Add Action**.
3. Set **Authentication** to `API Key` / `Bearer Token`.
4. Copy your secret key from **HardLife Studio → ChatGPT MCP**:
   - `hlc_mcp_hardlife_creator_studio_key_2026`
5. Set the Action URL / Schema Endpoint to:
   - `https://[YOUR_APP_URL]/api/mcp`
6. ChatGPT will automatically discover all 16 tools and can manage video production directly from chat.

---

## 🚀 Local Development & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npx --yes tsx --test src/lib/video-timeline.test.ts src/lib/mcp-schema.test.ts src/lib/security.test.ts src/lib/cost-calculator.test.ts server/ffmpeg.test.ts

# 3. Start development server
npm run dev

# 4. Production build & run full-stack server
npm run build
npm start
```

---

## 🛡️ Security & Zero-Trust Rules

Firestore security rules in `firestore.rules` enforce:
- Verified single owner (`kodir1988@gmail.com`).
- No public reads or writes on any collection.
- Relational ownership checks on every read and list query.
- Immutable append-only audit trail in `/activity_logs`.
