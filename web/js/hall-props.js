/* Renaissance furniture painted in code (carved wood, brass, velvet, gold).
   Each drawing keeps the sprite's id and size, and leaves the live overlays
   drawn by OfficeScene.prop (LEDs, screens, eyes, lamps) in their usual spots.
   Original art; no external assets. */
"use strict";
(() => {
  const GOLD = "#c9a44a";
  const GOLD_LIGHT = "#e6c872";
  const BRASS = "#a8863c";
  const BRASS_DARK = "#6b4f1c";
  const WOOD_DARK = "#4a2e1a";
  const WOOD_MID = "#6a4226";
  const WOOD_LIGHT = "#a8743c";
  const VELVET = "#8e1f26";
  const VELVET_LIGHT = "#b02a33";
  const PARCHMENT = "#e6d3a3";
  const INK = "#3a2a18";
  const LEAF = ["#2f6b3c", "#3f7a4a", "#4f8f55"];
  const R = (s) => s.rect.bind(s);
  const f = (v) => Math.max(1, Math.round(v));

  function leaves(s, x, y, w, h, list) {
    const r = R(s);
    list.forEach(([fx, fy, fw, fh], i) => {
      const lx = x + fx * w,
        ly = y + fy * h,
        lw = f(fw * w),
        lh = f(fh * h);
      r(lx, ly, lw, lh, LEAF[i % 3]);
      r(lx, ly, lw, 1, LEAF[(i + 2) % 3]);
      r(lx + lw / 2, ly, 1, lh, "#1f4a2a");
    });
  }
  function urn(s, x, y, w, h, color) {
    const r = R(s);
    r(x, y, w, 2, GOLD);
    r(x + 1, y + 2, w - 2, h - 5, color);
    r(x + 1, y + 2, 1, h - 5, "#ffffff22");
    r(x + 1, y + Math.floor(h / 2), w - 2, 1, GOLD);
    r(x + 2, y + h - 3, w - 4, 3, BRASS_DARK);
    r(x + 2, y + h - 3, w - 4, 1, GOLD);
  }

  const PROPS = {
    sofa(s, x, y) {
      const r = R(s);
      r(x + 2, y + 2, 36, 13, WOOD_DARK);
      r(x + 2, y + 2, 36, 1, GOLD);
      r(x + 4, y + 4, 32, 9, "#7a1a22");
      for (let bx = 8; bx < 36; bx += 8) {
        r(x + bx, y + 7, 2, 2, GOLD);
        r(x + bx, y + 4, 1, 9, "#6a1519");
      }
      r(x + 3, y + 14, 34, 7, VELVET);
      r(x + 3, y + 14, 34, 1, VELVET_LIGHT);
      r(x + 20, y + 14, 1, 7, "#6a1519");
      r(x, y + 8, 5, 15, WOOD_MID);
      r(x + 35, y + 8, 5, 15, WOOD_MID);
      r(x, y + 7, 5, 2, GOLD);
      r(x + 35, y + 7, 5, 2, GOLD);
      r(x + 3, y + 21, 34, 3, WOOD_DARK);
      r(x + 3, y + 21, 34, 1, GOLD);
      r(x + 2, y + 24, 4, 4, WOOD_MID);
      r(x + 34, y + 24, 4, 4, WOOD_MID);
    },
    server(s, x, y, w, h) {
      const r = R(s);
      r(x, y, w, h, WOOD_DARK);
      r(x, y, w, 2, GOLD);
      r(x + 2, y + 4, w - 4, f(h * 0.4), "#1b2a33");
      for (let lx = 2; lx < w - 2; lx += 4)
        r(x + lx, y + 4, 1, f(h * 0.4), GOLD);
      r(x + 2, y + 4 + f(h * 0.2), w - 4, 1, GOLD);
      r(x + 2, y + f(h * 0.5), w - 4, h - f(h * 0.5) - 3, WOOD_MID);
      r(x + 4, y + f(h * 0.55), w - 8, h - f(h * 0.55) - 6, WOOD_DARK);
      r(x + w / 2 - 1, y + f(h * 0.7), 2, 2, GOLD);
      r(x - 1, y + h - 3, w + 2, 3, "#2c1b0e");
      r(x - 1, y + h - 3, w + 2, 1, GOLD);
    },
    monstera(s, x, y, w, h) {
      const potH = f(h * 0.34);
      leaves(s, x, y, w, h - potH + 2, [
        [0.05, 0.4, 0.38, 0.2],
        [0.55, 0.35, 0.4, 0.2],
        [0.2, 0.12, 0.36, 0.22],
        [0.45, 0.04, 0.36, 0.22],
        [0.3, 0.5, 0.4, 0.22],
        [0, 0.62, 0.3, 0.2],
        [0.66, 0.58, 0.3, 0.2],
      ]);
      urn(s, x + w * 0.2, y + h - potH, f(w * 0.6), potH, "#1f3f7a");
    },
    coffee(s, x, y) {
      const r = R(s);
      r(x + 3, y + 17, 2, 9, WOOD_DARK);
      r(x + 15, y + 17, 2, 9, WOOD_DARK);
      r(x + 1, y + 15, 18, 3, WOOD_MID);
      r(x + 1, y + 15, 18, 1, GOLD);
      // Brass samovar.
      r(x + 5, y + 4, 10, 11, BRASS);
      r(x + 5, y + 4, 2, 11, GOLD_LIGHT);
      r(x + 4, y + 8, 12, 1, GOLD);
      r(x + 6, y + 2, 8, 2, BRASS_DARK);
      r(x + 8, y, 4, 2, GOLD);
      r(x + 15, y + 9, 3, 1, BRASS);
      r(x + 17, y + 9, 1, 3, BRASS);
    },
    cooler(s, x, y) {
      const r = R(s);
      r(x + 1, y + 20, 10, 6, WOOD_DARK);
      r(x + 1, y + 20, 10, 1, GOLD);
      r(x + 3, y + 7, 6, 13, "#3f6a8a");
      r(x + 3, y + 7, 1, 13, "#6a96b4");
      r(x + 2, y + 10, 8, 6, "#3f6a8a");
      r(x + 2, y + 12, 8, 1, GOLD);
      r(x + 4, y + 3, 4, 4, "#3f6a8a");
      r(x + 3, y + 2, 6, 1, GOLD);
      r(x, y + 8, 2, 5, BRASS);
      r(x + 10, y + 8, 2, 5, BRASS);
    },
    stool(s, x, y) {
      const r = R(s);
      r(x + 1, y + 1, 14, 5, VELVET);
      r(x + 1, y + 1, 14, 1, VELVET_LIGHT);
      r(x, y + 6, 16, 2, GOLD);
      r(x + 2, y + 8, 2, 10, WOOD_MID);
      r(x + 12, y + 8, 2, 10, WOOD_MID);
      r(x + 3, y + 12, 10, 1, WOOD_DARK);
    },
    succulent(s, x, y, w, h) {
      const r = R(s);
      leaves(s, x, y, w, h - 6, [
        [0.1, 0.3, 0.35, 0.3],
        [0.5, 0.2, 0.4, 0.35],
        [0.3, 0, 0.35, 0.4],
      ]);
      r(x + 2, y + h - 7, w - 4, 7, "#1f3f7a");
      r(x + 2, y + h - 7, w - 4, 1, GOLD);
    },
    planter(s, x, y, w, h) {
      const r = R(s);
      for (let bx = 1; bx < w - 6; bx += 7) {
        r(x + bx, y + 1, 6, 8, LEAF[(bx >> 2) % 3]);
        r(x + bx + 2, y, 3, 3, LEAF[((bx >> 2) + 1) % 3]);
      }
      r(x, y + 8, w, h - 8, "#8a8070");
      r(x, y + 8, w, 1, GOLD);
      r(x + 1, y + 10, w - 2, 1, "#6e6556");
      for (let bx = 4; bx < w - 3; bx += 8) r(x + bx, y + 12, 3, 3, GOLD);
    },
    whiteboard(s, x, y) {
      const r = R(s);
      r(x + 4, y + 26, 2, 6, WOOD_MID);
      r(x + 28, y + 26, 2, 6, WOOD_MID);
      r(x, y, 34, 27, WOOD_DARK);
      r(x, y, 34, 1, GOLD);
      r(x + 2, y + 2, 30, 23, PARCHMENT);
      r(x + 4, y + 5, 14, 1, INK);
      r(x + 4, y + 9, 22, 1, INK);
      r(x + 4, y + 13, 18, 1, INK);
      r(x + 4, y + 17, 24, 1, INK);
      r(x + 24, y + 4, 4, 4, VELVET);
      r(x + 25, y + 5, 2, 2, VELVET_LIGHT);
      r(x + 3, y + 26, 28, 2, WOOD_MID);
    },
    printer(s, x, y) {
      const r = R(s);
      r(x, y + 12, 24, 12, WOOD_DARK);
      r(x, y + 12, 24, 1, GOLD);
      r(x + 3, y + 15, 7, 6, WOOD_MID);
      r(x + 12, y + 15, 9, 6, WOOD_MID);
      r(x + 6, y + 17, 2, 2, GOLD);
      r(x + 16, y + 17, 2, 2, GOLD);
      // Slanted writing board with a sheet, inkwell and quill.
      r(x + 2, y + 6, 20, 6, WOOD_LIGHT);
      r(x + 4, y + 4, 14, 6, PARCHMENT);
      r(x + 5, y + 6, 8, 1, INK);
      r(x + 5, y + 8, 10, 1, INK);
      r(x + 19, y + 7, 3, 4, "#1b2a33");
      r(x + 20, y + 1, 1, 7, "#e8dfc8");
      r(x + 21, y, 1, 3, "#f4efe0");
    },
    cart(s, x, y) {
      const r = R(s);
      r(x + 1, y + 7, 26, 2, GOLD);
      r(x + 2, y + 9, 24, 2, WOOD_MID);
      r(x + 2, y + 17, 24, 2, WOOD_MID);
      r(x + 3, y + 9, 2, 12, WOOD_DARK);
      r(x + 23, y + 9, 2, 12, WOOD_DARK);
      r(x + 4, y + 3, 3, 4, "#efe3c4");
      r(x + 4, y + 2, 3, 1, GOLD);
      r(x + 10, y + 1, 3, 6, "#2f6b4a");
      r(x + 11, y, 1, 1, GOLD);
      r(x + 18, y + 4, 5, 3, GOLD_LIGHT);
      r(x + 4, y + 12, 5, 4, VELVET);
      r(x + 3, y + 21, 6, 4, WOOD_DARK);
      r(x + 4, y + 22, 4, 2, BRASS);
      r(x + 19, y + 21, 6, 4, WOOD_DARK);
      r(x + 20, y + 22, 4, 2, BRASS);
    },
    coatrack(s, x, y) {
      const r = R(s);
      r(x + 7, y + 3, 2, 29, WOOD_MID);
      r(x + 7, y + 3, 1, 29, WOOD_LIGHT);
      r(x + 6, y, 4, 3, GOLD);
      r(x + 1, y + 6, 14, 1, BRASS);
      r(x + 1, y + 4, 2, 3, GOLD);
      r(x + 13, y + 4, 2, 3, GOLD);
      // A red cloak hangs from one hook.
      r(x + 1, y + 7, 6, 15, VELVET);
      r(x + 1, y + 7, 1, 15, "#6a1519");
      r(x + 3, y + 8, 3, 1, GOLD);
      r(x + 4, y + 30, 8, 2, BRASS_DARK);
      r(x + 2, y + 32, 12, 2, WOOD_DARK);
      r(x + 2, y + 32, 12, 1, GOLD);
    },
    arcade(s, x, y) {
      const r = R(s);
      r(x, y, 24, 34, WOOD_DARK);
      r(x, y, 24, 3, GOLD);
      r(x + 10, y + 1, 4, 2, "#2f6bb0");
      r(x + 2, y + 5, 20, 12, WOOD_MID);
      r(x + 3, y + 6, 18, 10, GOLD);
      r(x + 4, y + 7, 16, 8, "#162b38");
      r(x + 2, y + 18, 20, 5, BRASS);
      r(x + 4, y + 19, 3, 3, VELVET);
      r(x + 10, y + 20, 3, 2, GOLD_LIGHT);
      r(x + 16, y + 19, 2, 3, "#2f6b4a");
      r(x + 2, y + 24, 20, 8, WOOD_MID);
      r(x + 4, y + 26, 16, 5, WOOD_DARK);
      r(x - 1, y + 31, 26, 3, "#2c1b0e");
    },
    recordplayer(s, x, y) {
      const r = R(s);
      r(x + 1, y + 13, 26, 8, WOOD_DARK);
      r(x + 1, y + 13, 26, 1, GOLD);
      r(x + 3, y + 14, 14, 4, "#1b1b1b");
      r(x + 8, y + 15, 3, 2, VELVET);
      // Flared brass horn.
      r(x + 17, y + 11, 4, 4, BRASS);
      r(x + 19, y + 7, 5, 8, BRASS);
      r(x + 21, y + 2, 6, 14, GOLD);
      r(x + 21, y + 2, 1, 14, GOLD_LIGHT);
      r(x + 3, y + 21, 3, 1, WOOD_MID);
      r(x + 22, y + 21, 3, 1, WOOD_MID);
    },
    robot(s, x, y, w, h) {
      const r = R(s);
      r(x + 4, y + 1, 10, 9, BRASS);
      r(x + 4, y + 1, 10, 1, GOLD_LIGHT);
      r(x + 5, y + 4, 8, 3, "#1b2a33");
      r(x + 6, y + 5, 2, 1, "#b1e1cc");
      r(x + 10, y + 5, 2, 1, "#b1e1cc");
      r(x + 8, y - 2, 2, 3, GOLD);
      r(x + 3, y + 10, 12, 10, BRASS_DARK);
      r(x + 3, y + 10, 12, 1, GOLD);
      r(x + 7, y + 12, 4, 4, GOLD);
      r(x + 8, y + 13, 2, 2, "#1b2a33");
      r(x, y + 11, 3, 8, BRASS);
      r(x + 15, y + 11, 3, 8, BRASS);
      r(x + 5, y + 20, 3, h - 22, BRASS);
      r(x + 10, y + 20, 3, h - 22, BRASS);
      r(x + 4, y + h - 3, 5, 3, BRASS_DARK);
      r(x + 9, y + h - 3, 5, 3, BRASS_DARK);
    },
    terrarium(s, x, y) {
      const r = R(s);
      r(x + 2, y + 22, 20, 6, WOOD_DARK);
      r(x + 2, y + 22, 20, 1, GOLD);
      r(x + 4, y + 5, 16, 17, "#9cc7d633");
      r(x + 4, y + 5, 1, 17, "#cfe6ee");
      r(x + 19, y + 5, 1, 17, "#cfe6ee");
      r(x + 6, y + 3, 12, 2, "#9cc7d655");
      r(x + 10, y + 1, 4, 2, GOLD);
      leaves(s, x + 6, y + 9, 12, 12, [
        [0, 0.4, 0.45, 0.25],
        [0.5, 0.2, 0.45, 0.3],
        [0.2, 0, 0.4, 0.3],
      ]);
      r(x + 5, y + 19, 14, 3, "#5a3a20");
    },
    jukebox(s, x, y) {
      const r = R(s);
      // Pipe organ: gilded pipes above a carved case.
      const heights = [12, 16, 20, 16, 12];
      heights.forEach((ph, i) => {
        r(x + 2 + i * 4, y + 22 - ph, 3, ph, GOLD);
        r(x + 2 + i * 4, y + 22 - ph, 1, ph, GOLD_LIGHT);
        r(x + 3 + i * 4, y + 21 - ph, 1, 2, BRASS_DARK);
      });
      r(x, y + 20, 24, 14, WOOD_DARK);
      r(x, y + 20, 24, 2, GOLD);
      r(x + 3, y + 24, 18, 7, WOOD_MID);
      r(x + 5, y + 26, 14, 3, "#1b2a33");
      r(x + 11, y + 25, 2, 2, GOLD);
      r(x - 1, y + 32, 26, 4, "#2c1b0e");
      r(x - 1, y + 32, 26, 1, GOLD);
    },
    focusbooth(s, x, y) {
      const r = R(s);
      r(x, y + 2, 30, 36, WOOD_DARK);
      r(x - 1, y, 32, 4, WOOD_MID);
      r(x - 1, y, 32, 1, GOLD);
      r(x + 3, y + 8, 24, 27, "#241509");
      // Arched opening with a velvet curtain.
      r(x + 6, y + 9, 18, 2, WOOD_MID);
      r(x + 4, y + 11, 22, 24, WOOD_MID);
      r(x + 6, y + 13, 18, 22, VELVET);
      for (let cx = 7; cx < 24; cx += 4) r(x + cx, y + 13, 1, 22, "#6a1519");
      r(x + 13, y + 5, 4, 4, GOLD);
      r(x + 14, y + 6, 2, 2, "#2f6bb0");
      r(x - 1, y + 35, 32, 3, "#2c1b0e");
      r(x - 1, y + 35, 32, 1, GOLD);
    },
    filingcabinet(s, x, y) {
      const r = R(s);
      r(x, y, 22, 26, WOOD_DARK);
      r(x, y, 22, 1, GOLD);
      for (const dy of [2, 10, 18]) {
        r(x + 2, y + dy, 18, 7, WOOD_MID);
        r(x + 2, y + dy, 18, 1, WOOD_LIGHT);
        r(x + 8, y + dy + 3, 6, 2, GOLD);
        r(x + 4, y + dy + 2, 3, 2, PARCHMENT);
      }
      r(x + 1, y + 25, 20, 1, "#2c1b0e");
    },
    taskterminal(s, x, y) {
      const r = R(s);
      // Lectern with an angled tablet; the screen sits where the live lamps draw.
      r(x + 2, y + 1, 20, 14, WOOD_DARK);
      r(x + 2, y + 1, 20, 1, GOLD);
      r(x + 4, y + 3, 16, 9, GOLD);
      r(x + 5, y + 4, 14, 7, "#14262c");
      r(x + 3, y + 15, 18, 3, WOOD_MID);
      r(x + 8, y + 18, 8, 12, WOOD_DARK);
      r(x + 8, y + 18, 1, 12, WOOD_LIGHT);
      r(x + 10, y + 22, 4, 2, GOLD);
      r(x + 3, y + 30, 18, 4, "#2c1b0e");
      r(x + 3, y + 30, 18, 1, GOLD);
    },
    statusbeacon(s, x, y) {
      const r = R(s);
      r(x + 5, y + 10, 2, 16, BRASS);
      r(x + 5, y + 10, 1, 16, GOLD_LIGHT);
      r(x + 2, y + 1, 8, 9, "#1b2a33");
      r(x + 1, y, 10, 2, GOLD);
      r(x + 1, y + 9, 10, 2, GOLD);
      r(x + 1, y + 2, 1, 7, GOLD);
      r(x + 10, y + 2, 1, 7, GOLD);
      r(x + 5, y - 2, 2, 2, GOLD);
      r(x + 2, y + 25, 8, 3, BRASS_DARK);
      r(x + 2, y + 25, 8, 1, GOLD);
    },
    petbed(s, x, y) {
      const r = R(s);
      r(x + 3, y + 2, 20, 12, WOOD_MID);
      r(x, y + 5, 26, 8, WOOD_MID);
      r(x + 2, y + 4, 22, 8, VELVET);
      r(x + 4, y + 5, 18, 5, VELVET_LIGHT);
      r(x + 3, y + 3, 20, 1, GOLD);
      r(x + 3, y + 13, 20, 1, GOLD);
      for (let fx = 4; fx < 24; fx += 3) r(x + fx, y + 14, 1, 2, GOLD);
    },
    fern(s, x, y, w, h) {
      const potH = f(h * 0.32);
      leaves(s, x, y, w, h - potH + 2, [
        [0, 0.5, 0.35, 0.18],
        [0.65, 0.5, 0.35, 0.18],
        [0.1, 0.28, 0.35, 0.18],
        [0.55, 0.28, 0.35, 0.18],
        [0.3, 0.05, 0.4, 0.25],
        [0.25, 0.45, 0.5, 0.2],
      ]);
      urn(s, x + w * 0.2, y + h - potH, f(w * 0.6), potH, VELVET);
    },
    DOOR(s, x, y, w, h) {
      const r = R(s);
      r(x, y, w, h, GOLD);
      r(x + 1, y + 2, w - 2, h - 2, WOOD_DARK);
      r(x + 2, y + 1, w - 4, 1, GOLD);
      r(x + 2, y + 4, w - 4, 8, WOOD_MID);
      r(x + 3, y + 5, w - 6, 6, WOOD_DARK);
      r(x + 2, y + 14, w - 4, 8, WOOD_MID);
      r(x + 3, y + 15, w - 6, 6, WOOD_DARK);
      r(x + w - 4, y + 13, 2, 2, GOLD_LIGHT);
    },
    clock(s, x, y, w, h) {
      const r = R(s);
      r(x + 1, y, w - 2, h, GOLD);
      r(x, y + 1, w, h - 2, GOLD);
      r(x + 2, y + 2, w - 4, h - 4, "#efe3c4");
      r(x + 5, y + 3, 1, 3, INK);
      r(x + 5, y + 5, 3, 1, INK);
      r(x + 1, y + 5, 1, 1, BRASS_DARK);
      r(x + w - 2, y + 5, 1, 1, BRASS_DARK);
    },
  };

  const base = OfficeScene.prototype.hallProp;
  OfficeScene.prototype.hallProp = function (kind, x, y, w, h) {
    const draw = PROPS[kind];
    if (!draw) return base.call(this, kind, x, y, w, h);
    draw(this, x, y, w, h);
    return true;
  };
  // Wall fixtures are not furniture props, so they have their own entry point.
  OfficeScene.prototype.hallFixture = function (kind, x, y, w, h) {
    if (!["DOOR", "clock"].includes(kind)) return false;
    PROPS[kind](this, x, y, w, h);
    return true;
  };
})();
