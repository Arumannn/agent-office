/* Dashboard panels. Read-only views of /state: absent data is stated as such,
   never invented. Text is always inserted literally. */
"use strict";
(() => {
  const NOT_REPORTED = "Not reported";
  const ORDER = ["waiting", "working", "thinking", "idle", "done", "gone"];
  // A glyph accompanies each status so meaning never depends on color alone.
  const GLYPH = {
    waiting: "!",
    working: "▶",
    thinking: "…",
    idle: "–",
    done: "✓",
    gone: "×",
  };
  const TASK_NAMES = {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Done",
    cancelled: "Cancelled",
  };
  const NOTABLE = new Set([
    "session_start",
    "session_end",
    "session_error",
    "approval_request",
    "input_request",
    "subagent_start",
    "subagent_stop",
  ]);
  const MAX_GROUPS = 3;
  const MAX_CHILDREN = 8;
  let state = null;
  let boardFilter = "all";
  let networkView = "graph";
  const signatures = new Map();
  const portraits = new Map();

  const $ = (id) => document.getElementById(id);
  const node = (tag, className, text) => {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (text !== undefined) result.textContent = text;
    return result;
  };
  const statusKey = (status) => (ORDER.includes(status) ? status : "idle");
  const statusLabel = (status) =>
    status === "waiting" ? "Needs input" : STATUS_NAMES[status] || status;
  const clock = (ts) => {
    const date = new Date(Number(ts) * 1000);
    return Number.isFinite(date.getTime())
      ? date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "--:--:--";
  };
  const short = (text, max) =>
    text.length > max ? text.slice(0, max - 1) + "…" : text;
  // Rebuild a container only when its data changed, so focus and text
  // selection survive unchanged polls.
  const changed = (key, value) => {
    const signature = JSON.stringify(value);
    if (signatures.get(key) === signature) return false;
    signatures.set(key, signature);
    return true;
  };
  const empty = (text) => node("p", "dash-empty", text);

  function portrait(agent) {
    const sprites = scene?.sprites;
    if (!sprites) return "";
    const key = characterSpriteKey(agent, settings, sprites);
    const image = sprites[key] || sprites["char" + (hash(agent.id) % 6)];
    if (!image) return "";
    const cached = portraits.get(key);
    if (cached?.image === image) return cached.url;
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 14;
    canvas.getContext("2d").drawImage(image, 0, 8, 16, 14, 0, 0, 16, 14);
    const url = canvas.toDataURL();
    portraits.set(key, { image, url });
    return url;
  }
  function portraitNode(agent, className) {
    const holder = node("span", className);
    holder.setAttribute("aria-hidden", "true");
    const url = portrait(agent);
    if (url) holder.style.backgroundImage = `url(${url})`;
    return holder;
  }

  function agentButton(agent, existing) {
    const button = existing || node("button", "dash-agent");
    button.type = "button";
    button.dataset.agent = agent.id;
    const status = statusKey(agent.status);
    const tool = agent.tool ? String(agent.tool).replaceAll("_", " ") : "";
    const detail = [runtimeName(agent), tool].filter(Boolean).join(" · ");
    const signature = JSON.stringify([
      agent.label,
      status,
      detail,
      portrait(agent) ? 1 : 0,
    ]);
    if (button.dataset.sig !== signature) {
      button.dataset.sig = signature;
      const copy = node("span", "dash-agent-copy");
      copy.append(
        node("strong", "", String(agent.label || agent.id)),
        node("small", "", detail),
      );
      const chip = node("span", "chip " + status);
      chip.append(
        node("span", "glyph", GLYPH[status]),
        document.createTextNode(statusLabel(agent.status)),
      );
      chip.firstChild.setAttribute("aria-hidden", "true");
      button.replaceChildren(portraitNode(agent, "dash-portrait"), copy, chip);
    }
    button.onclick = () => selectAgent(agent.id);
    return button;
  }
  function updateAgents() {
    const box = $("dash-agents");
    const list = [...(agents || [])].sort(
      (a, b) =>
        ORDER.indexOf(statusKey(a.status)) - ORDER.indexOf(statusKey(b.status)),
    );
    const existing = new Map(
      [...box.querySelectorAll("[data-agent]")].map((n) => [
        n.dataset.agent,
        n,
      ]),
    );
    if (!list.length) {
      if (changed("agents-empty", true))
        box.replaceChildren(empty("No agents reported yet."));
      return;
    }
    signatures.delete("agents-empty");
    box.querySelector(".dash-empty")?.remove();
    reconcileAgentCards(
      box,
      list.map((agent) => agentButton(agent, existing.get(agent.id))),
      null,
    );
  }

  function updateEnvironment() {
    const theme = THEMES.find((t) => t.id === settings.theme) || THEMES[0];
    $("env-name").textContent = theme.name;
    const swatch = $("env-swatch");
    if (changed("swatch", theme.id)) {
      swatch.replaceChildren(
        ...[theme.wall, theme.floor, theme.rug, theme.accent].map((color) => {
          const chip = node("span");
          chip.style.background = color;
          return chip;
        }),
      );
    }
  }

  function updateTerminal(events) {
    const box = $("dash-terminal");
    const recent = events.slice(-30);
    if (
      !changed(
        "terminal",
        recent.map((e) => [
          e.ts,
          e.event,
          e.session_id,
          e.tool_name,
          e.preview,
        ]),
      )
    )
      return;
    const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 12;
    const top = box.scrollTop;
    if (!recent.length) {
      box.replaceChildren(empty("No events observed yet."));
      return;
    }
    const names = new Map((agents || []).map((a) => [a.id, a.label || a.id]));
    box.replaceChildren(
      ...recent.map((e) => {
        const row = node("div", "term-row");
        const who = names.get(e.session_id) || e.platform || e.session_id || "";
        row.append(
          node("time", "term-time", clock(e.ts)),
          node(
            "span",
            "term-who",
            who ? "[" + short(String(who), 18) + "]" : "",
          ),
          node("span", "term-text", eventText(e)),
        );
        return row;
      }),
    );
    box.scrollTop = atEnd ? box.scrollHeight : top;
  }

  function boardRows(boards) {
    const rows = [];
    for (const board of Array.isArray(boards) ? boards : []) {
      if (!board || !Array.isArray(board.tasks)) continue;
      const owner = (agents || []).find((a) => a.id === board.session_id);
      for (const task of board.tasks)
        if (task && typeof task.content === "string" && TASK_NAMES[task.status])
          rows.push({
            id: board.runtime + "/" + board.session_id + "/" + task.id,
            content: task.content,
            status: task.status,
            owner: owner?.label || board.session_id || "",
            ended: board.historical !== false,
          });
    }
    return rows;
  }
  function updateBoard(boards) {
    const rows = boardRows(boards);
    const counts = {
      all: rows.length,
      pending: rows.filter((r) => r.status === "pending").length,
      in_progress: rows.filter((r) => r.status === "in_progress").length,
      completed: rows.filter((r) => r.status === "completed").length,
    };
    const filters = $("board-filters");
    if (changed("board-filters", [counts, boardFilter])) {
      filters.replaceChildren(
        ...[
          ["all", "All"],
          ["pending", "Pending"],
          ["in_progress", "In progress"],
          ["completed", "Done"],
        ].map(([key, name]) => {
          const button = node("button", "", name + " " + counts[key]);
          button.type = "button";
          button.setAttribute("aria-pressed", String(boardFilter === key));
          button.onclick = () => {
            boardFilter = key;
            updateBoard(state?.tasks);
          };
          return button;
        }),
      );
    }
    const visible = rows.filter(
      (r) => boardFilter === "all" || r.status === boardFilter,
    );
    if (!changed("board-rows", [visible, boardFilter, rows.length])) return;
    const box = $("dash-tasks");
    if (!rows.length) {
      box.replaceChildren(
        empty(NOT_REPORTED + ". No runtime has reported a task list."),
      );
      return;
    }
    if (!visible.length) {
      box.replaceChildren(empty("No tasks in this view."));
      return;
    }
    box.replaceChildren(
      ...visible.map((row) => {
        const item = node("div", "task-row " + row.status);
        const copy = node("span", "task-copy");
        copy.append(
          node("strong", "", row.content),
          node("small", "", row.owner + (row.ended ? " · ended session" : "")),
        );
        item.append(copy, node("span", "chip task", TASK_NAMES[row.status]));
        return item;
      }),
    );
  }

  function networkGroups() {
    const byId = new Map((agents || []).map((a) => [a.id, a]));
    const groups = new Map();
    for (const agent of agents || [])
      if (agent.parent) {
        if (!groups.has(agent.parent)) groups.set(agent.parent, []);
        groups.get(agent.parent).push(agent);
      }
    return { byId, groups };
  }
  function networkNode(agent, id, x, y, root) {
    const button = node("button", "net-node" + (root ? " root" : ""));
    button.type = "button";
    button.style.left = x + "%";
    button.style.top = y + "%";
    const status = agent ? statusKey(agent.status) : "gone";
    const label = agent ? String(agent.label || agent.id) : String(id);
    button.append(
      agent
        ? portraitNode(agent, "net-portrait " + status)
        : node("span", "net-portrait gone"),
      node("span", "net-label", short(label, 14)),
      node(
        "small",
        "net-status",
        (GLYPH[status] || "") +
          " " +
          (agent ? statusLabel(agent.status) : "Ended"),
      ),
    );
    button.title = label;
    if (agent) button.onclick = () => selectAgent(agent.id);
    else button.disabled = true;
    return button;
  }
  function updateNetwork() {
    const box = $("dash-network");
    const { byId, groups } = networkGroups();
    const parents = [...groups.keys()];
    const snapshot = parents.map((id) => [
      id,
      byId.get(id)?.status,
      byId.get(id)?.label,
      groups.get(id).map((a) => [a.id, a.status, a.label]),
    ]);
    if (!changed("network", [snapshot, networkView, scene?.loadedAssets || 0]))
      return;
    if (!parents.length) {
      box.replaceChildren(
        empty(
          "No subagents reported. Parent and child sessions appear here when a runtime delegates work.",
        ),
      );
      return;
    }
    if (networkView === "list") {
      const list = node("ul", "net-list");
      for (const id of parents) {
        const item = node("li");
        const parent = byId.get(id);
        item.append(
          node(
            "strong",
            "",
            String(parent?.label || id) +
              (parent ? " · " + statusLabel(parent.status) : " · Ended"),
          ),
        );
        const sub = node("ul");
        for (const child of groups.get(id)) {
          const row = node("li");
          const open = node("button", "link", String(child.label || child.id));
          open.type = "button";
          open.onclick = () => selectAgent(child.id);
          row.append(
            open,
            document.createTextNode(" · " + statusLabel(child.status)),
          );
          sub.append(row);
        }
        item.append(sub);
        list.append(item);
      }
      box.replaceChildren(list);
      return;
    }
    const shown = parents.slice(0, MAX_GROUPS);
    const graph = node("div", "net-graph");
    const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lines.setAttribute("viewBox", "0 0 100 100");
    lines.setAttribute("preserveAspectRatio", "none");
    lines.setAttribute("aria-hidden", "true");
    const nodes = [];
    shown.forEach((id, index) => {
      const cx = (100 * (index + 0.5)) / shown.length;
      const children = groups.get(id).slice(0, MAX_CHILDREN);
      const rx = Math.min(36, 40 / shown.length + 6);
      children.forEach((child, i) => {
        // A lone child sits beside its parent; several spread around it.
        const angle =
          children.length === 1
            ? 0
            : -Math.PI / 2 + (2 * Math.PI * i) / children.length;
        const x = cx + rx * Math.cos(angle);
        const y = 50 + 34 * Math.sin(angle);
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        line.setAttribute("x1", cx);
        line.setAttribute("y1", 50);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        lines.append(line);
        nodes.push(networkNode(child, child.id, x, y, false));
      });
      nodes.push(networkNode(byId.get(id), id, cx, 50, true));
    });
    graph.append(lines, ...nodes);
    box.replaceChildren(graph);
    const hidden =
      parents.length -
      shown.length +
      shown.reduce(
        (n, id) => n + Math.max(0, groups.get(id).length - MAX_CHILDREN),
        0,
      );
    if (hidden > 0)
      box.append(
        node(
          "p",
          "dash-empty",
          "+" + hidden + " more. Use the List view for all of them.",
        ),
      );
  }

  function updateNotices(events) {
    const notable = events
      .filter((e) => NOTABLE.has(e.event))
      .slice(-12)
      .reverse();
    if (
      !changed(
        "notices",
        notable.map((e) => [e.ts, e.event, e.session_id, e.child_session_id]),
      )
    )
      return;
    const box = $("dash-notices");
    if (!notable.length) {
      box.replaceChildren(empty("No notifications yet."));
      return;
    }
    box.replaceChildren(
      ...notable.map((e) => {
        const row = node("div", "notice-row " + e.event);
        const copy = node("span", "notice-copy");
        copy.append(
          node("strong", "", EVENT_NAMES[e.event] || e.event),
          node(
            "small",
            "",
            short(
              eventText(e)
                .replace(EVENT_NAMES[e.event] || "", "")
                .replace(/^ · /, "") ||
                e.platform ||
                "",
              80,
            ),
          ),
        );
        row.append(copy, node("time", "", clock(e.ts).slice(0, 5)));
        return row;
      }),
    );
  }

  function updateApprovals() {
    const waiting = (agents || []).filter((a) => a.status === "waiting");
    if (
      !changed(
        "approvals",
        waiting.map((a) => [a.id, a.label, a.detail, a.platform]),
      )
    )
      return;
    const box = $("dash-approvals");
    if (!waiting.length) {
      box.replaceChildren(empty("No pending requests."));
      return;
    }
    box.replaceChildren(
      ...waiting.map((agent) => {
        const row = node("div", "approval-row");
        const copy = node("span", "approval-copy");
        copy.append(
          node("strong", "", String(agent.label || agent.id)),
          node(
            "small",
            "",
            runtimeName(agent) +
              " · " +
              (agent.detail || "Waiting for a response"),
          ),
        );
        const open = node("button", "btn small", "Inspect");
        open.type = "button";
        open.setAttribute("aria-label", "Inspect " + (agent.label || agent.id));
        open.onclick = () => selectAgent(agent.id);
        row.append(copy, open);
        return row;
      }),
    );
  }

  function update(next) {
    state = next || state;
    if (!state) return;
    updateAgents();
    updateEnvironment();
    updateTerminal(state.events || []);
    updateBoard(state.tasks);
    updateNetwork();
    updateNotices(state.events || []);
    updateApprovals();
  }

  $("env-change").onclick = () => $("themeNextbtn").click();
  $("board-new").onclick = () => openSheet("sheet-tasks");
  $("logs-open").onclick = () => openSheet("sheet-events");
  for (const [id, view] of [
    ["network-graph", "graph"],
    ["network-list", "list"],
  ])
    $(id).onclick = () => {
      networkView = view;
      $("network-graph").setAttribute("aria-pressed", String(view === "graph"));
      $("network-list").setAttribute("aria-pressed", String(view === "list"));
      update();
    };

  window.officeDashboard = { update, syncTheme: updateEnvironment };
})();
