const $ = (selector) => document.querySelector(selector);
const sidebar = $("#sidebar");
const panel = $("#slidePanel");
const scrim = $("#scrim");

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
  $("#branchPopover").classList.add("hidden");
  $("#profilePopover").classList.add("hidden");
  $("#notificationPopover").classList.add("hidden");
  $("#searchPopover").classList.add("hidden");
  $("#searchInline").classList.add("max-w-0", "opacity-0");
  $("#searchInline").classList.remove("max-w-[13rem]", "opacity-100");
  $("#searchButton").classList.remove("rounded-r-lg");
  $("#searchButton").classList.add("rounded-lg");
  $("#branchPicker").setAttribute("aria-expanded", "false");
  $("#profileButton").setAttribute("aria-expanded", "false");
  $("#notificationButton").setAttribute("aria-expanded", "false");
  $("#searchButton").setAttribute("aria-expanded", "false");
}

function togglePopover(trigger, popover) {
  const opening = popover.classList.contains("hidden");
  closePopovers();
  popover.classList.toggle("hidden", !opening);
  trigger.setAttribute("aria-expanded", String(opening));
}

$("#branchPicker").addEventListener("click", () =>
  togglePopover($("#branchPicker"), $("#branchPopover")),
);
$("#profileButton").addEventListener("click", () =>
  togglePopover($("#profileButton"), $("#profilePopover")),
);
$("#notificationButton").addEventListener("click", () =>
  togglePopover($("#notificationButton"), $("#notificationPopover")),
);
$("#searchButton").addEventListener("click", () => {
  const popover = $("#searchPopover");
  const opening = popover.classList.contains("hidden");
  togglePopover($("#searchButton"), popover);
  if (opening) {
    $("#searchInline").classList.remove("max-w-0", "opacity-0");
    $("#searchInline").classList.add("max-w-[13rem]", "opacity-100");
    $("#searchButton").classList.remove("rounded-lg");
    $("#searchButton").classList.add("rounded-r-lg");
    $("#searchInput").focus();
  }
});

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
      "#branchPicker, #profileButton, #notificationButton, #searchButton, #branchPopover, #profilePopover, #notificationPopover, #searchPopover",
    )
  )
    closePopovers();
});

$("#menuGroup").addEventListener("click", () => {
  const group = $("#menuGroup");
  const isOpen = group.getAttribute("aria-expanded") === "true";
  group.setAttribute("aria-expanded", String(!isOpen));
  $("#menuSubnav").classList.toggle("hidden", isOpen);
  group.querySelector("i:last-child").className = isOpen
    ? "sidebar-chevron icon-chevron-down ml-auto"
    : "sidebar-chevron icon-chevron-up ml-auto";
});

function togglePanel(open) {
  panel.classList.toggle("translate-x-full", !open);
  scrim.classList.toggle("hidden", !open);
}

$("#panelTrigger").addEventListener("click", () => togglePanel(true));
$("#stockButton").addEventListener("click", () => togglePanel(true));
$("#closePanel").addEventListener("click", () => togglePanel(false));
scrim.addEventListener("click", () => {
  togglePanel(false);
  sidebar.classList.add("-translate-x-full");
});

$("#newBooking").addEventListener("click", () =>
  $("#bookingDialog").showModal(),
);
$("#mobileMenu").addEventListener("click", () => {
  sidebar.classList.remove("-translate-x-full");
  scrim.classList.remove("hidden");
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
  $("#sidebarToggle").classList.toggle("hidden", collapsed);
  sidebar
    .querySelector(".sidebar-service-status")
    .classList.toggle("hidden", collapsed);
  $("#menuSubnav").classList.toggle("hidden", collapsed);
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
  if (sidebar.classList.contains("w-[68px]")) toggleSidebar();
});
