/* Dashboard panels show only what /state reports; synthetic events, real observer. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { observerFixture } = require("./observer-fixture.cjs");

const texts = (page, selector) => page.locator(selector).allInnerTexts();

test("with no reports every panel says so and invents no numbers or controls", async () => {
  await observerFixture({ events: [] }, async ({ page }) => {
    await page.waitForFunction(() => initialized);
    assert.match(await page.textContent("#dash-agents"), /No agents reported/);
    assert.match(await page.textContent("#dash-tasks"), /Not reported/);
    assert.match(
      await page.textContent("#dash-network"),
      /No subagents reported/,
    );
    assert.match(
      await page.textContent("#dash-approvals"),
      /No pending requests/,
    );
    assert.match(await page.textContent("#dash-notices"), /No notifications/);
    assert.equal(await page.locator("#dash-bottom .task-row").count(), 0);
    const panels = await page.locator(".dash-panel").allInnerTexts();
    assert.equal(
      panels.some((text) => /\d\s*%/.test(text)),
      false,
    );
    assert.equal(
      await page
        .locator("#approval-control button")
        .filter({ hasText: /approve|reject|deny|allow/i })
        .count(),
      0,
    );
  });
});

test("reported agents, tasks, subagents and requests appear literally and stay observe-only", async () => {
  const events = [
    {
      event: "session_start",
      platform: "claude",
      session_id: "dash-main",
      title: "<b>Ship</b> the release",
    },
    {
      event: "subagent_start",
      platform: "claude",
      parent_session_id: "dash-main",
      child_session_id: "dash-child",
      child_goal: "Review the diff",
    },
    {
      event: "tasks_update",
      platform: "claude",
      session_id: "dash-main",
      task_source: "claude.todo",
      tasks: [
        { id: "a", content: "Write <i>tests</i>", status: "in_progress" },
        { id: "b", content: "Update docs", status: "pending" },
        { id: "c", content: "Tag release", status: "completed" },
      ],
    },
    {
      event: "approval_request",
      platform: "claude",
      session_id: "dash-main",
      request_id: "dash-approval",
      command: "Apply the patch",
    },
  ];
  await observerFixture({ events }, async ({ page, state }) => {
    await page.waitForFunction(
      () => document.querySelectorAll("#dash-agents [data-agent]").length >= 2,
    );
    const before = JSON.stringify((await state()).progress);
    // Agent Status: text status, not only color.
    assert.match(await page.textContent("#dash-agents"), /Needs input/);
    // Task Board: real statuses and counts, no progress percentages.
    await page.waitForFunction(
      () => document.querySelectorAll("#dash-tasks .task-row").length === 3,
    );
    assert.deepEqual(await texts(page, "#board-filters button"), [
      "All 3",
      "Pending 1",
      "In progress 1",
      "Done 1",
    ]);
    assert.ok(
      (await page.textContent("#dash-tasks")).includes("Write <i>tests</i>"),
    );
    assert.equal(await page.locator("#dash-tasks i").count(), 0);
    await page.click("#board-filters >> text=Pending");
    assert.equal(await page.locator("#dash-tasks .task-row").count(), 1);
    assert.equal((await page.textContent("#panel-board")).includes("%"), false);
    // Subagent Network: graph and list from the real parent link.
    await page.waitForFunction(
      () => document.querySelectorAll("#dash-network .net-node").length === 2,
    );
    await page.click("#network-list");
    assert.equal(
      await page.getAttribute("#network-list", "aria-pressed"),
      "true",
    );
    assert.match(await page.textContent("#dash-network"), /Review the diff/);
    await page.click("#network-graph");
    // Approval Control: observed request, answered elsewhere, no decision buttons.
    assert.match(
      await page.textContent("#dash-approvals"),
      /Apply the patch|dash-main/,
    );
    assert.match(
      await page.textContent("#approval-control"),
      /answered in the runtime/,
    );
    assert.equal(
      await page
        .locator("#approval-control button")
        .filter({ hasText: /approve|reject|deny|allow/i })
        .count(),
      0,
    );
    // Terminal is a read-only log region.
    assert.equal(await page.getAttribute("#dash-terminal", "role"), "log");
    assert.equal(
      await page.locator("#dash-terminal input, #dash-terminal button").count(),
      0,
    );
    assert.match(
      await page.textContent("#dash-terminal"),
      /Approval requested/,
    );
    // Existing tools stay reachable from the new panels.
    await page.click("#board-new");
    assert.equal(await page.locator("#sheet-tasks").isVisible(), true);
    await page.keyboard.press("Escape");
    await page.click('#dash-agents [data-agent="dash-main"]');
    assert.equal(await page.locator("#sheet-inspector").isVisible(), true);
    await page.keyboard.press("Escape");
    const name = await page.textContent("#env-name");
    await page.click("#env-change");
    await page.waitForFunction(
      (name) => document.getElementById("env-name").textContent !== name,
      name,
    );
    assert.equal(
      JSON.stringify((await state()).progress),
      before,
      "panels never award XP",
    );
  });
});
