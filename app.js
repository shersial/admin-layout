const $ = (selector) => document.querySelector(selector);
const sidebar = $("#sidebar");
const panel = $("#slidePanel");
const scrim = $("#scrim");
let panelOpener;

function trapFocus(event, container) {
  if (event.key !== "Tab") return;
  const focusable = [
    ...container.querySelectorAll(
      "a[href], button:not([disabled]), textarea, input, select",
    ),
  ];
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

panel.addEventListener("keydown", (event) => trapFocus(event, panel));

sidebar.querySelectorAll(".sidebar-item").forEach((item) => {
  const tooltip = document.createElement("span");
  const tooltipId = `tooltip-${item.dataset.tooltip.toLowerCase().replaceAll(" ", "-")}`;
  tooltip.id = tooltipId;
  tooltip.setAttribute("role", "tooltip");
  tooltip.className =
    "sidebar-tooltip pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-plum px-3 py-2 text-sm font-medium text-white opacity-0 shadow-card transition-opacity duration-150 before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-y-4 before:border-r-4 before:border-y-transparent before:border-r-plum";
  tooltip.textContent = item.dataset.tooltip;
  item.classList.add("relative");
  item.setAttribute("aria-describedby", tooltipId);
  item.append(tooltip);
  item.addEventListener("pointerenter", () => {
    if (sidebar.classList.contains("w-[68px]"))
      tooltip.classList.replace("opacity-0", "opacity-100");
  });
  item.addEventListener("pointerleave", () =>
    tooltip.classList.replace("opacity-100", "opacity-0"),
  );
  item.addEventListener("focusin", () => {
    if (sidebar.classList.contains("w-[68px]"))
      tooltip.classList.replace("opacity-0", "opacity-100");
  });
  item.addEventListener("focusout", () =>
    tooltip.classList.replace("opacity-100", "opacity-0"),
  );
});

function closePopovers() {
  $("#sidebarBranchPopover").classList.add("hidden");
  $("#profilePopover").classList.add("hidden");
  $("#notificationPopover").classList.add("hidden");
  $("#searchPopover").classList.add("hidden");
  $("#profileButton").setAttribute("aria-expanded", "false");
  $("#notificationButton").setAttribute("aria-expanded", "false");
  $("#commandSearch").setAttribute("aria-expanded", "false");
}

function togglePopover(trigger, popover) {
  const opening = popover.classList.contains("hidden");
  closePopovers();
  popover.classList.toggle("hidden", !opening);
  trigger.setAttribute("aria-expanded", String(opening));
}

$("#profileButton").addEventListener("click", () =>
  togglePopover($("#profileButton"), $("#profilePopover")),
);
$("#notificationButton").addEventListener("click", () =>
  togglePopover($("#notificationButton"), $("#notificationPopover")),
);
function openCommandSearch() {
  const popover = $("#searchPopover");
  const opening = popover.classList.contains("hidden");
  togglePopover($("#commandSearch"), popover);
  if (opening) $("#searchInput").focus();
}

$("#commandSearch").addEventListener("click", openCommandSearch);

$("#searchInput").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  const results = [...document.querySelectorAll(".search-result")];
  const visible = results.filter((result) => {
    const match = result.textContent.toLowerCase().includes(query);
    result.classList.toggle("hidden", !match);
    return match;
  });
  $("#noSearchResults").classList.toggle("hidden", visible.length !== 0);
});

document.addEventListener("click", (event) => {
  if (
    !event.target.closest(
      "#sidebarLogo, #sidebarBranchPopover, #profileButton, #notificationButton, #commandSearch, #profilePopover, #notificationPopover, #searchPopover",
    )
  )
    closePopovers();
});

$("#menuGroup").addEventListener("click", () => {
  const group = $("#menuGroup");
  const isOpen = group.getAttribute("aria-expanded") === "true";
  group.setAttribute("aria-expanded", String(!isOpen));
  $("#menuSubnav").classList.toggle("hidden", isOpen);
  group.querySelector("i:last-child").className =
    "sidebar-chevron icon-chevron-down ml-auto text-sm transition-transform";
});

function togglePanel(open, opener) {
  if (open) panelOpener = opener || document.activeElement;
  panel.classList.toggle("translate-x-full", !open);
  panel.toggleAttribute("inert", !open);
  $("#appShell").toggleAttribute("inert", open);
  scrim.classList.toggle("hidden", !open);
  if (open) $("#closePanel").focus();
  else panelOpener?.focus();
}

$("#panelTrigger").addEventListener("click", (event) => togglePanel(true, event.currentTarget));
$("#stockButton").addEventListener("click", (event) => togglePanel(true, event.currentTarget));
$("#closePanel").addEventListener("click", () => togglePanel(false));
scrim.addEventListener("click", () => {
  togglePanel(false);
  closeMobileMenu();
});

$("#newBooking").addEventListener("click", () =>
  $("#bookingDialog").showModal(),
);
$("#dashboardBooking").addEventListener("click", () =>
  $("#bookingDialog").showModal(),
);
function closeMobileMenu() {
  sidebar.classList.add("-translate-x-full");
  sidebar.setAttribute("inert", "");
  scrim.classList.add("hidden");
  $("#mobileMenu").setAttribute("aria-expanded", "false");
}

function syncMobileNavigation() {
  if (window.innerWidth >= 1024) sidebar.removeAttribute("inert");
  else if (sidebar.classList.contains("-translate-x-full")) sidebar.setAttribute("inert", "");
}

syncMobileNavigation();
window.addEventListener("resize", syncMobileNavigation);

$("#mobileMenu").addEventListener("click", () => {
  sidebar.classList.remove("-translate-x-full");
  sidebar.removeAttribute("inert");
  scrim.classList.remove("hidden");
  $("#mobileMenu").setAttribute("aria-expanded", "true");
  sidebar.querySelector("a, button").focus();
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandSearch();
    return;
  }
  if (event.key !== "Escape") return;
  if (!panel.classList.contains("translate-x-full")) togglePanel(false);
  else if (window.innerWidth < 1024 && !sidebar.classList.contains("-translate-x-full")) {
    closeMobileMenu();
    $("#mobileMenu").focus();
  }
});

function toggleSidebar() {
  const collapsed = sidebar.classList.toggle("w-[68px]");
  sidebar.classList.toggle("w-64", !collapsed);
  sidebar.classList.toggle("px-2", collapsed);
  sidebar.classList.toggle("px-3", !collapsed);
  sidebar
    .querySelector(".sidebar-brand")
    .classList.toggle("justify-center", collapsed);
  sidebar
    .querySelector(".sidebar-brand-name")
    .classList.toggle("hidden", collapsed);
  sidebar
    .querySelector(".sidebar-service-status")
    ?.classList.toggle("hidden", collapsed);
  $("#menuSubnav").classList.toggle(
    "hidden",
    collapsed || $("#menuGroup").getAttribute("aria-expanded") !== "true",
  );
  sidebar
    .querySelectorAll(".sidebar-group-label, .sidebar-projects")
    .forEach((element) => element.classList.toggle("hidden", collapsed));
  sidebar.querySelectorAll(".sidebar-item").forEach((item) => {
    item.classList.toggle("justify-center", collapsed);
    item.classList.toggle("gap-3", !collapsed);
    item.classList.toggle("px-3", !collapsed);
    item.classList.toggle("px-0", collapsed);
    item
      .querySelectorAll("span, b, .sidebar-chevron")
      .forEach((label) => label.classList.toggle("hidden", collapsed));
    item.setAttribute("aria-label", collapsed ? item.dataset.tooltip : "");
    item
      .querySelector(".sidebar-tooltip")
      .classList.toggle("hidden", !collapsed);
  });
  $("#sidebarToggle").setAttribute(
    "aria-label",
    collapsed ? "Expand sidebar" : "Collapse sidebar",
  );
  $("#sidebarToggle i").className = collapsed
    ? "icon-panel-left-open"
    : "icon-panel-left-close";
  $("#sidebarLogo").setAttribute(
    "aria-label",
    collapsed ? "Expand sidebar" : "OrderPortal home",
  );
  $("#sidebarLogo").setAttribute(
    "title",
    collapsed ? "Expand sidebar" : "OrderPortal home",
  );
}

$("#sidebarToggle").addEventListener("click", toggleSidebar);
$("#sidebarLogo").addEventListener("click", () => {
  if (sidebar.classList.contains("w-[68px]")) {
    toggleSidebar();
    return;
  }
  togglePopover($("#sidebarLogo"), $("#sidebarBranchPopover"));
});
