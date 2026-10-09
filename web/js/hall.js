/* Renaissance hall drawing: marble, stone and carved wood painted in code.
   Pure presentation. Room geometry, hit areas, collision and routes are
   unchanged, and the older themes keep their original drawing. */
"use strict";
(() => {
  const hex = (color) => {
    const n = parseInt(color.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const toHex = (rgb) =>
    "#" +
    rgb
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  const mix = (a, b, amount) => {
    const x = hex(a),
      y = hex(b);
    return toHex(x.map((v, i) => v + (y[i] - v) * amount));
  };
  const shade = (color, amount) =>
    mix(color, amount < 0 ? "#000000" : "#ffffff", Math.abs(amount));
  const GOLD = "#c9a44a";
  const GOLD_LIGHT = "#e6c872";
  const BANNER = "#8e1f26";
  const BANNER_DARK = "#6a1519";
  const STONE = "#cbbf9f";
  const WOOD_DARK = "#4a2e1a";
  const WOOD_MID = "#6a4226";
  const WOOD_LIGHT = "#a8743c";

  // Statue sprite, one character per logical pixel. Original art.
  const STATUE = [
    "....hh....",
    "...hhhh...",
    "...hhhh...",
    "....hh....",
    "..ssssss..",
    ".sssssssss",
    ".ssdssdsss",
    ".ssdssdsss",
    "..ssdsdss.",
    "..ssdsdss.",
    "..ssdsdss.",
    "..sdsssds.",
    "..sdsssds.",
    "..sdsssds.",
    ".ssdsssdss",
    "ppppppppp.",
    "pppppppppp",
    ".pppppppp.",
    ".pppppppp.",
    ".pppppppp.",
    "bbbbbbbbbb",
  ];
  const STATUE_COLORS = {
    h: "#e4ddcc",
    s: "#d3cbb8",
    d: "#a99f89",
    p: "#9c9078",
    b: "#756a56",
  };

  function arch(scene, x, y, w, h, color) {
    // Rounded-top window silhouette, one pixel row at a time.
    const rx = w / 2,
      ry = Math.min(Math.round(w / 4), Math.floor(h / 2));
    for (let row = 0; row < h; row++) {
      let inset = 0;
      if (row < ry) {
        const k = (ry - row - 0.5) / ry;
        inset = Math.round(rx - rx * Math.sqrt(Math.max(0, 1 - k * k)));
      }
      scene.rect(x + inset, y + row, w - inset * 2, 1, color);
    }
  }

  const methods = {
    hallColors(t) {
      return {
        stone: mix(t.wall, STONE, 0.6),
        mortar: mix(t.wall, "#3a2d20", 0.45),
        grout: mix(t.seam, "#000000", 0.2),
      };
    },
    hallFloor(w, h, t, dark) {
      const r = this.rect.bind(this),
        size = 12,
        top = 26,
        { grout } = this.hallColors(t);
      for (let ty = 0, y = top; y < h - 4; ty++, y += size) {
        for (let tx = 0, x = 4; x < w - 4; tx++, x += size) {
          const tileW = Math.min(size, w - 4 - x),
            tileH = Math.min(size, h - 4 - y),
            base = (tx + ty) % 2 ? t.plank : t.floor;
          r(x, y, tileW, tileH, base);
          // Veining: two deterministic flecks per tile, kept inside the tile.
          const n = hash("marble" + tx + ":" + ty),
            fleck = (dx, dy, fw, fh, color) => {
              if (dx + fw < tileW - 1 && dy + fh < tileH - 1)
                r(x + dx, y + dy, fw, fh, color);
            };
          fleck((n % 9) + 1, ((n >> 4) % 9) + 1, 2, 1, shade(base, 0.12));
          fleck((n >> 8) % 9, ((n >> 12) % 9) + 1, 1, 2, shade(base, -0.1));
          r(x, y + tileH - 1, tileW, 1, grout);
          r(x + tileW - 1, y, 1, tileH, grout);
        }
      }
      r(4, top, w - 8, 3, "#00000026");
      if (dark) r(4, top, w - 8, h - top - 4, "#0a0f2a12");
    },
    hallWall(w, h, t) {
      const r = this.rect.bind(this),
        { stone, mortar } = this.hallColors(t);
      // Stone courses above carved wood paneling.
      r(3, 3, w - 6, 12, stone);
      for (let y = 3, row = 0; y < 15; y += 6, row++) {
        r(3, y + 5, w - 6, 1, mortar);
        for (let x = 3 + (row % 2) * 8; x < w - 3; x += 16)
          r(x, y, 1, 6, mortar);
      }
      r(3, 15, w - 6, 9, t.wall);
      for (let x = 5; x < w - 5; x += 6) {
        r(x, 17, 1, 6, shade(t.wall, -0.28));
        r(x + 1, 17, 1, 6, shade(t.wall, 0.12));
      }
      r(3, 15, w - 6, 1, shade(t.wall, 0.25));
      r(3, 24, w - 6, 3, t.trim);
      r(3, 24, w - 6, 1, t.accent);
      r(3, 3, w - 6, 2, t.trim);
      r(3, 5, w - 6, 1, t.accent);
      r(3, 27, w - 6, 2, "#15182430");
    },
    hallWindows(w, t, dark, windowWidth, xs) {
      const r = this.rect.bind(this);
      for (const x0 of xs) {
        const x = Math.round(x0),
          top = 6,
          height = 18;
        arch(this, x - 2, top - 1, windowWidth + 4, height + 1, GOLD);
        arch(this, x - 1, top, windowWidth + 2, height, t.trim);
        arch(
          this,
          x + 1,
          top + 1,
          windowWidth - 2,
          height - 1,
          dark ? "#1b2748" : "#79b0d6",
        );
        // Lower glass is lighter; the arch carries colored lead panes.
        r(
          x + 1,
          top + 10,
          windowWidth - 2,
          height - 10,
          dark ? "#26375f" : "#9ccbe4",
        );
        const colors = dark
          ? ["#6a2330", "#6e5a24", "#2c5a52"]
          : ["#c0392b", "#e0b43c", "#3f8f6b"];
        const panes = Math.max(2, Math.floor((windowWidth - 4) / 8));
        for (let i = 0; i < panes; i++)
          r(
            x + 2 + Math.round(((windowWidth - 4) / panes) * i) + 1,
            top + 3,
            Math.max(2, Math.floor((windowWidth - 4) / panes) - 2),
            3,
            colors[i % colors.length],
          );
        // Leading: central mullion, a transom and diamond lattice ticks.
        r(x + windowWidth / 2 - 1, top + 1, 2, height - 1, GOLD);
        r(x + 1, top + 9, windowWidth - 2, 1, GOLD);
        if (dark) {
          r(x + 6, top + 12, 1, 1, "#f2dc9a");
          r(x + windowWidth - 8, top + 14, 1, 1, "#f2dc9a");
        } else {
          r(x + windowWidth - 14, top + 12, 7, 1, "#f2f8f2");
        }
        r(x - 2, top + height, windowWidth + 4, 1, GOLD);
      }
    },
    hallBanner(x, y, h) {
      const r = this.rect.bind(this);
      r(x - 1, y, 11, 1, GOLD);
      r(x, y + 1, 9, h, BANNER);
      r(x, y + 1, 1, h, BANNER_DARK);
      r(x + 1, y + 2, 7, 1, GOLD);
      // Pointed lower edge.
      r(x, y + 1 + h, 3, 1, BANNER);
      r(x + 6, y + 1 + h, 3, 1, BANNER);
      r(x, y + 1 + h, 1, 1, BANNER_DARK);
      r(x + 3, y + h, 3, 2, BANNER);
      r(x + 4, y + 1 + h, 1, 2, BANNER);
      // Cross emblem.
      r(x + 4, y + 4, 1, 7, GOLD_LIGHT);
      r(x + 2, y + 6, 5, 1, GOLD_LIGHT);
    },
    hallLamp(x) {
      const r = this.rect.bind(this),
        lit = this.settings.room_lights !== false;
      r(x, 3, 1, 5, GOLD);
      r(x - 3, 8, 7, 1, GOLD);
      r(x - 2, 9, 5, 3, "#8a6a2a");
      r(x - 2, 9, 5, 1, GOLD_LIGHT);
      if (lit) {
        const flicker = Math.floor(this.time * 7 + x) % 2;
        r(x - 1, 12, 3, 1, "#ffd27a");
        r(x, 13, 1, flicker ? 2 : 1, "#ffa23a");
      } else r(x - 1, 12, 3, 1, "#5a4a2a");
    },
    // ---- Furniture samples: carved wood, brass and gold, same sizes as the sprites.
    hallDeskLegs(x, y) {
      const r = this.rect.bind(this);
      for (const lx of [x + 3, x + 34]) {
        r(lx, y + 10, 3, 11, WOOD_DARK);
        r(lx, y + 10, 1, 11, WOOD_LIGHT);
        r(lx, y + 14, 3, 1, GOLD);
        r(lx - 1, y + 20, 5, 1, GOLD);
      }
    },
    hallDeskTop(x, y) {
      const r = this.rect.bind(this);
      // Writing surface with grain, then a carved apron with gilded panels.
      r(x, y + 7, 40, 1, GOLD_LIGHT);
      r(x, y + 8, 40, 3, WOOD_LIGHT);
      r(x + 3, y + 9, 12, 1, shade(WOOD_LIGHT, -0.12));
      r(x + 21, y + 10, 14, 1, shade(WOOD_LIGHT, -0.12));
      r(x, y + 11, 40, 1, GOLD);
      r(x, y + 12, 40, 6, WOOD_DARK);
      for (const px of [x + 2, x + 15, x + 28]) {
        r(px, y + 13, 10, 4, WOOD_MID);
        r(px + 1, y + 14, 8, 2, shade(WOOD_DARK, -0.2));
        r(px + 4, y + 14, 2, 2, GOLD);
      }
      r(x, y + 18, 40, 1, GOLD);
      r(x + 1, y + 19, 38, 1, shade(WOOD_DARK, -0.3));
    },
    hallChair(x, y) {
      const r = this.rect.bind(this);
      r(x + 9, y - 3, 14, 13, WOOD_DARK);
      r(x + 11, y - 1, 10, 9, BANNER);
      r(x + 11, y - 1, 10, 1, "#b02a33");
      r(x + 15, y + 2, 2, 2, GOLD);
      r(x + 11, y - 5, 10, 3, WOOD_MID);
      r(x + 9, y - 6, 2, 3, GOLD);
      r(x + 21, y - 6, 2, 3, GOLD);
      r(x + 10, y + 10, 12, 3, "#3a2314");
      r(x + 10, y + 10, 12, 1, GOLD);
    },
    hallMonitorBezel(x, y) {
      const r = this.rect.bind(this);
      r(x + 24, y - 7, 15, 1, GOLD);
      r(x + 24, y - 7, 1, 14, GOLD);
      r(x + 38, y - 7, 1, 14, GOLD);
    },
    hallProp(kind, x, y, w, h) {
      const r = this.rect.bind(this);
      if (kind === "shelf") {
        r(x, y, w, h, WOOD_DARK);
        r(x + 2, y + 4, w - 4, h - 8, "#241509");
        const spines = [
          BANNER,
          "#1f3f7a",
          "#2f6b4a",
          GOLD,
          "#6b3f8a",
          "#a8855a",
        ];
        for (const [row, top] of [
          [0, y + 5],
          [1, y + 12],
          [2, y + 19],
        ]) {
          let bx = x + 3;
          for (let i = 0; bx < x + w - 5; i++) {
            const n = hash("book" + row + ":" + i),
              bw = 2 + (n % 2),
              bh = 4 + ((n >> 3) % 3);
            r(bx, top + 6 - bh, bw, bh, spines[n % spines.length]);
            r(bx, top + 6 - bh, 1, bh, shade(spines[n % spines.length], 0.2));
            bx += bw + ((n >> 6) % 2);
          }
          r(x + 2, top + 6, w - 4, 1, WOOD_LIGHT);
        }
        r(x - 1, y, w + 2, 3, WOOD_MID);
        r(x - 1, y, w + 2, 1, GOLD);
        r(x, y + 3, 2, h - 6, WOOD_MID);
        r(x + w - 2, y + 3, 2, h - 6, WOOD_MID);
        r(x - 1, y + h - 3, w + 2, 3, "#2c1b0e");
        r(x - 1, y + h - 3, w + 2, 1, GOLD);
        return true;
      }
      if (kind === "roundtable") {
        const top = [
          [6, 16],
          [3, 22],
          [1, 26],
          [0, 28],
          [0, 28],
          [1, 26],
          [3, 22],
          [6, 16],
        ];
        top.forEach(([dx, dw], i) => r(x + dx, y + 1 + i, dw, 1, GOLD));
        top.forEach(([dx, dw], i) => {
          if (i > 0 && i < top.length - 1)
            r(x + dx + 1, y + 1 + i, dw - 2, 1, WOOD_MID);
        });
        // A parchment map lies in the middle of the table.
        r(x + 8, y + 3, 12, 4, "#e6d3a3");
        r(x + 9, y + 4, 4, 1, "#9a7b4a");
        r(x + 14, y + 5, 4, 1, "#3f6a8a");
        r(x + 12, y + 9, 4, 9, WOOD_DARK);
        r(x + 12, y + 12, 4, 1, GOLD);
        r(x + 7, y + 18, 14, 2, WOOD_MID);
        r(x + 5, y + 20, 18, 2, WOOD_DARK);
        r(x + 5, y + 20, 18, 1, GOLD);
        return true;
      }
      if (kind === "lamp") {
        const lit = this.settings.room_lights !== false,
          flicker = Math.floor(this.time * 7 + x) % 2;
        r(x + 5, y + 8, 2, 18, "#a8863c");
        r(x + 5, y + 8, 1, 18, GOLD_LIGHT);
        r(x + 3, y + 15, 6, 1, GOLD);
        r(x + 2, y + 25, 8, 2, "#8a6a2a");
        r(x + 1, y + 27, 10, 3, "#6b4f1c");
        r(x + 1, y + 27, 10, 1, GOLD_LIGHT);
        // Three arms, each ending in a candle.
        r(x + 1, y + 9, 10, 1, GOLD);
        for (const cx of [x + 1, x + 5, x + 10]) {
          r(cx, y + 5, 2, 5, "#efe3c4");
          r(cx, y + 5, 2, 1, "#d9c9a0");
          if (lit) {
            r(cx, y + 3, 2, 2, "#ffd27a");
            if (flicker) r(cx, y + 2, 1, 1, "#ffa23a");
          } else r(cx, y + 4, 2, 1, "#3a2f20");
        }
        return true;
      }
      return false;
    },
    hallRug(x, y, w, h, t) {
      const r = this.rect.bind(this);
      r(x, y, w, h, t.rug);
      r(x + 2, y + 2, w - 4, 1, t.accent);
      r(x + 2, y + h - 3, w - 4, 1, t.accent);
      r(x + 2, y + 2, 1, h - 4, t.accent);
      r(x + w - 3, y + 2, 1, h - 4, t.accent);
      r(x + 4, y + 4, w - 8, 1, shade(t.rug, 0.18));
      r(x + 4, y + h - 5, w - 8, 1, shade(t.rug, 0.18));
      for (let dx = 8; dx < w - 8; dx += 8) {
        r(x + dx, y + 1, 1, 1, t.accent);
        r(x + dx, y + h - 2, 1, 1, t.accent);
      }
    },
    hallSign(w, name) {
      const r = this.rect.bind(this);
      r(w / 2 - 21, 6, 42, 16, GOLD);
      r(w / 2 - 20, 7, 40, 14, "#0f141c");
      this.text(name, w / 2, 16, GOLD_LIGHT, 4, "center");
    },
    hallLight(w, h, dark) {
      const g = this.ctx;
      const lit = this.settings.room_lights !== false;
      const pool = (x, y, radius, alpha) => {
        const grad = g.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgba(255,178,84,${alpha})`);
        grad.addColorStop(1, "rgba(255,178,84,0)");
        g.fillStyle = grad;
        g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      };
      if (!this.hallLamps || !lit) return;
      for (const x of this.hallLamps)
        pool(x, 14, dark ? 42 : 26, dark ? 0.34 : 0.12);
    },
    // Screen-space hall around the room: dark marble, columns, banners and
    // statues, so the canvas reads as a palace rather than an empty void.
    hallBackdrop(W, H, ox, oy, scale, room, t, dark) {
      const g = this.ctx,
        u = Math.max(1, scale);
      const tile = Math.round(12 * u);
      const cols = [
        mix(t.floor, "#000000", 0.82),
        mix(t.plank, "#000000", 0.82),
      ];
      const startX = Math.round(ox) % tile;
      const startY = Math.round(oy) % tile;
      for (let y = startY - tile, row = 0; y < H; y += tile, row++)
        for (let x = startX - tile, col = 0; x < W; x += tile, col++) {
          g.fillStyle = cols[(row + col) % 2];
          g.fillRect(x, y, tile, tile);
        }
      const left = ox,
        right = W - (ox + room.w * scale);
      const shaft = mix(STONE, "#000000", dark ? 0.55 : 0.4);
      const column = (cx) => {
        const cw = Math.round(9 * u),
          x = Math.round(cx - cw / 2),
          top = Math.round(Math.max(0, oy - 4 * u)),
          bottom = Math.round(Math.min(H, oy + (room.h + 6) * scale));
        g.fillStyle = shaft;
        g.fillRect(x, top, cw, bottom - top);
        g.fillStyle = shade(shaft, -0.25);
        g.fillRect(
          x + cw - Math.round(2 * u),
          top,
          Math.round(2 * u),
          bottom - top,
        );
        g.fillStyle = shade(shaft, 0.18);
        g.fillRect(x + Math.round(u), top, Math.round(u), bottom - top);
        g.fillStyle = GOLD;
        g.fillRect(
          x - Math.round(2 * u),
          top,
          cw + Math.round(4 * u),
          Math.round(3 * u),
        );
        g.fillRect(
          x - Math.round(2 * u),
          bottom - Math.round(3 * u),
          cw + Math.round(4 * u),
          Math.round(3 * u),
        );
      };
      const banner = (cx) => {
        const bw = Math.round(8 * u),
          x = Math.round(cx - bw / 2),
          y = Math.round(oy + 8 * u),
          bh = Math.round(34 * u);
        g.fillStyle = BANNER;
        g.fillRect(x, y, bw, bh);
        g.fillStyle = BANNER_DARK;
        g.fillRect(x, y, Math.round(u), bh);
        g.fillStyle = GOLD;
        g.fillRect(
          x - Math.round(u),
          y - Math.round(u),
          bw + Math.round(2 * u),
          Math.round(u),
        );
        g.fillRect(
          x + Math.round(3.5 * u),
          y + Math.round(6 * u),
          Math.round(u),
          Math.round(14 * u),
        );
        g.fillRect(
          x + Math.round(1.5 * u),
          y + Math.round(10 * u),
          Math.round(5 * u),
          Math.round(u),
        );
        g.fillStyle = shaft;
        g.fillRect(x, y + bh, Math.round(3 * u), Math.round(2 * u));
        g.fillRect(
          x + bw - Math.round(3 * u),
          y + bh,
          Math.round(3 * u),
          Math.round(2 * u),
        );
      };
      const statue = (cx) => {
        const px = Math.max(1, Math.round(1.6 * u)),
          sw = STATUE[0].length * px,
          sh = STATUE.length * px,
          x = Math.round(cx - sw / 2),
          y = Math.round(oy + (room.h - 6) * scale - sh);
        STATUE.forEach((rowText, j) =>
          [...rowText].forEach((cell, i) => {
            if (cell === ".") return;
            g.fillStyle = dark
              ? mix(STATUE_COLORS[cell], "#000000", 0.45)
              : STATUE_COLORS[cell];
            g.fillRect(x + i * px, y + j * px, px, px);
          }),
        );
      };
      const margin = 12 * u;
      if (left >= margin + 10 * u) {
        column(ox - margin);
        banner(ox - margin);
      }
      if (right >= margin + 10 * u) {
        column(W - right + margin);
        banner(W - right + margin);
      }
      if (left >= margin * 2 + 80 * u) statue(ox - margin - 38 * u);
      if (right >= margin * 2 + 80 * u) statue(W - right + margin + 38 * u);
      if (dark) {
        g.fillStyle = "rgba(6,8,22,0.42)";
        g.fillRect(0, 0, W, H);
      }
      // Warm torch glow beside each column at night.
      if (dark && this.settings.room_lights !== false)
        for (const cx of [ox - margin * 1.6, W - right + margin * 1.6]) {
          if (cx < 0 || cx > W) continue;
          const radius = 70 * u,
            grad = g.createRadialGradient(
              cx,
              oy + 40 * u,
              0,
              cx,
              oy + 40 * u,
              radius,
            );
          grad.addColorStop(0, "rgba(255,170,70,0.28)");
          grad.addColorStop(1, "rgba(255,170,70,0)");
          g.fillStyle = grad;
          g.fillRect(cx - radius, oy + 40 * u - radius, radius * 2, radius * 2);
        }
    },
  };
  Object.assign(OfficeScene.prototype, methods);
})();
