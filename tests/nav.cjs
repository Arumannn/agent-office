/* On narrow screens the sidebar is a collapsed menu; wide layouts need no step. */
async function openNav(page) {
  const toggle = page.locator("#menu-toggle");
  if (
    (await toggle.isVisible()) &&
    (await toggle.getAttribute("aria-expanded")) !== "true"
  )
    await toggle.click();
}
module.exports = { openNav };
