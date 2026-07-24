const $ = (selector) => document.querySelector(selector);
const sidebar = $("#sidebar");
const appShell = $("#appShell");
const main = document.querySelector("main");
const sharedHeader = document.querySelector("header");
const sharedFooter = document.querySelector("footer");
const panel = $("#slidePanel");
const scrim = $("#scrim");
let panelOpener;

function syncRoute() {
  const routeDetails = {
    overview: ["Overview", "Today", "OrderPortal | Operations"],
    orders: ["Operations", "Orders", "OrderPortal | Orders"],
    "live-orders": ["Operations", "Live orders", "OrderPortal | Live orders"],
    "menu-builder": ["Operations", "Menu builder", "OrderPortal | Menu builder"],
    settings: ["Workspace", "Settings", "OrderPortal | Settings"],
    "service-book": ["Service book", "Today's book", "OrderPortal | Service book"],
    waitlist: ["Service book", "Waitlist", "OrderPortal | Waitlist"],
    "floor-plan": ["Service book", "Floor plan", "OrderPortal | Floor plan"],
  };
  const requestedRoute = window.location.hash.slice(1);
  const route = routeDetails[requestedRoute] ? requestedRoute : "overview";
  const views = {
    overview: "#overviewView",
    orders: "#ordersView",
    "live-orders": "#liveOrdersView",
    "menu-builder": "#menuBuilderView",
    settings: "#settingsView",
    "service-book": "#serviceBookView",
    waitlist: "#waitlistView",
    "floor-plan": "#floorPlanView",
  };
  Object.entries(views).forEach(([name, selector]) =>
    $(selector).classList.toggle("hidden", route !== name),
  );
  $("#breadcrumbSection").textContent = routeDetails[route][0];
  $("#breadcrumbDetail").textContent = routeDetails[route][1];
  document.title = routeDetails[route][2];
  const serviceBoard = route === "live-orders";
  appShell.classList.toggle("fixed", serviceBoard);
  appShell.classList.toggle("inset-0", serviceBoard);
  appShell.classList.toggle("z-[70]", serviceBoard);
  appShell.classList.toggle("overflow-y-auto", serviceBoard);
  sidebar.classList.toggle("hidden", serviceBoard);
  sharedHeader.classList.toggle("hidden", serviceBoard);
  sharedFooter.classList.toggle("hidden", serviceBoard);
  main.classList.toggle("max-w-[1600px]", !serviceBoard);
  main.classList.toggle("max-w-none", serviceBoard);
  main.classList.toggle("min-h-screen", serviceBoard);
  document.body.classList.toggle("overflow-hidden", serviceBoard);
  Object.keys(views).forEach((name) => {
    const item = sidebar.querySelector(`.sidebar-item[href="#${name}"]`);
    if (!item) return;
    const active = route === name;
    item.classList.toggle("bg-white", active);
    item.classList.toggle("font-medium", active);
    item.classList.toggle("text-ink", active);
    item.classList.toggle("text-white/65", !active);
    item.classList.toggle("hover:bg-white/10", !active);
    item.classList.toggle("hover:text-white", !active);
  });
  sidebar.querySelectorAll("#menuSubnav a").forEach((item) => {
    const active = item.getAttribute("href") === `#${route}`;
    item.classList.toggle("font-medium", active);
    item.classList.toggle("text-lime", active);
    item.classList.toggle("text-white/55", !active);
  });
  window.dispatchEvent(new CustomEvent("orderportal:route", { detail: route }));
}

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
    "sidebar-tooltip pointer-events-none fixed z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-plum px-3 py-2 text-sm font-medium text-white opacity-0 shadow-card transition-opacity duration-150 before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-y-4 before:border-r-4 before:border-y-transparent before:border-r-plum";
  tooltip.textContent = item.dataset.tooltip;
  item.classList.add("relative");
  item.setAttribute("aria-describedby", tooltipId);
  item._tooltip = tooltip;
  document.body.append(tooltip);
  const showTooltip = () => {
    const rect = item.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 12}px`;
    tooltip.style.top = `${rect.top + rect.height / 2}px`;
    tooltip.classList.replace("opacity-0", "opacity-100");
  };
  item.addEventListener("pointerenter", () => {
    if (sidebar.classList.contains("w-[68px]")) showTooltip();
  });
  item.addEventListener("pointerleave", () =>
    tooltip.classList.replace("opacity-100", "opacity-0"),
  );
  item.addEventListener("focusin", () => {
    if (sidebar.classList.contains("w-[68px]")) showTooltip();
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
document.querySelectorAll("[data-booking-trigger]").forEach((button) =>
  button.addEventListener("click", () => $("#bookingDialog").showModal()),
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

sidebar.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener("click", (event) => {
    if (window.innerWidth >= 1024) return;
    requestAnimationFrame(() => {
      if (!sidebar.classList.contains("w-[68px]")) toggleSidebar();
    });
  }),
);

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandSearch();
    return;
  }
  if (event.key !== "Escape") return;
  if (window.location.hash === "#live-orders") {
    window.location.hash = "orders";
    return;
  }
  if (!panel.classList.contains("translate-x-full")) togglePanel(false);
  else if (window.innerWidth < 1024 && !sidebar.classList.contains("-translate-x-full")) {
    closeMobileMenu();
    $("#mobileMenu").focus();
  }
});

window.addEventListener("hashchange", syncRoute);
syncRoute();

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
  $("#menuSubnav").classList.toggle("hidden", collapsed);
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
    item._tooltip.classList.toggle("hidden", !collapsed);
    item._tooltip.classList.replace("opacity-100", "opacity-0");
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
  localStorage.setItem("orderPortalSidebarCollapsed", String(collapsed));
}

$("#sidebarToggle").addEventListener("click", toggleSidebar);
$("#sidebarLogo").addEventListener("click", () => {
  if (sidebar.classList.contains("w-[68px]")) {
    toggleSidebar();
    return;
  }
  togglePopover($("#sidebarLogo"), $("#sidebarBranchPopover"));
});

if (localStorage.getItem("orderPortalSidebarCollapsed") === "true") {
  toggleSidebar();
}

function announce(message) {
  let toast = $("#serviceToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "serviceToast";
    toast.className = "fixed bottom-5 right-5 z-[60] rounded-xl bg-plum px-4 py-3 text-sm font-semibold text-white shadow-card";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }
  toast.textContent = message;
  clearTimeout(announce.timeout);
  announce.timeout = setTimeout(() => toast.remove(), 2800);
}

document.querySelectorAll(".booking-row").forEach((row) =>
  row.addEventListener("click", () => announce(`${row.querySelector("strong").textContent.trim()} is checked in.`)),
);
document.querySelectorAll(".waitlist-notify").forEach((button) =>
  button.addEventListener("click", () => {
    button.textContent = "Notified";
    button.classList.add("border-accent", "text-accent");
    button.disabled = true;
    announce("Guest notification sent.");
  }),
);
$("#addWalkin").addEventListener("click", () => announce("Walk-in added to the queue."));
document.querySelectorAll(".floor-table").forEach((table) =>
  table.addEventListener("click", () => announce(`Table ${table.dataset.table} selected.`)),
);

const settingsPanel = $("#settingsPanel");
const settingsContent = {
  general: {
    Workspace: ["Workspace preferences", "Set the branch defaults used throughout this operations workspace.", "Service day starts", "10:00", "Default dashboard", "Operations overview"],
    Notifications: ["Notification rules", "Decide which alerts interrupt the team during service.", "Kitchen delays", "Urgent only", "Booking updates", "All service updates"],
  },
  restaurant: {
    Profile: ["Restaurant profile", "Keep the guest-facing venue details accurate across every channel.", "Venue name", "Vela, Shoreditch", "Contact number", "+44 20 7946 0182"],
    "Service hours": ["Service hours", "Define the service periods guests can book and order from.", "Lunch service", "12:00 - 15:30", "Dinner service", "18:00 - 23:30"],
    Locations: ["Locations", "Manage the venues included in this workspace.", "Primary location", "Shoreditch", "Additional location", "Notting Hill"],
  },
  team: {
    Members: ["Team members", "Invite colleagues and keep their contact details ready for shift handover.", "Active members", "24", "Pending invites", "2"],
    Roles: ["Service roles", "Set the responsibilities available to your restaurant team.", "Default manager role", "Shift manager", "Floor role", "Host"],
    Permissions: ["Permissions", "Control access to reporting, menu changes, and service controls.", "Menu publishing", "Managers only", "Refund approval", "Managers only"],
  },
  orders: {
    Channels: ["Order channels", "Choose where the restaurant accepts orders during this service.", "Dine-in", "Enabled", "Online ordering", "Enabled"],
    Preparation: ["Preparation targets", "Set the kitchen targets shown on every active ticket.", "Lunch target", "12 minutes", "Dinner target", "16 minutes"],
    Delivery: ["Delivery handoff", "Configure the delivery promise and driver pickup handoff.", "Collection buffer", "5 minutes", "Delivery promise", "35 minutes"],
  },
  integrations: {
    Payments: ["Payments", "Monitor the payment methods connected to this location.", "Terminal", "Vela Terminal 03", "Online payments", "Connected"],
    "Delivery apps": ["Delivery apps", "Control the marketplaces receiving your live menu.", "Deliveroo", "Connected", "Uber Eats", "Connected"],
    "Kitchen display": ["Kitchen display", "Assign the screen that receives live production tickets.", "Pass screen", "Kitchen display 01", "Sync status", "Live"],
  },
};
let activeSettingsTab = "general";
let activeSettingsChild = "Workspace";

function renderSettings() {
  const children = settingsContent[activeSettingsTab];
  const [title, description, firstLabel, firstValue, secondLabel, secondValue] = children[activeSettingsChild];
  settingsPanel.innerHTML = `<div class="flex flex-col gap-5"><div class="flex gap-1 overflow-x-auto border-b border-black/10 pb-3" role="tablist" aria-label="${activeSettingsTab} settings">${Object.keys(children).map((child) => `<button class="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${child === activeSettingsChild ? "bg-soft text-accent" : "text-black/55 hover:bg-black/5"}" data-settings-child="${child}" role="tab" aria-selected="${child === activeSettingsChild}" type="button">${child}</button>`).join("")}</div><div><p class="font-[DM_Mono] text-[10px] uppercase tracking-wider text-accent">${activeSettingsTab}</p><h2 class="mt-2 text-xl font-bold">${title}</h2><p class="mt-2 max-w-xl text-sm leading-relaxed text-black/55">${description}</p><div class="mt-6 grid gap-3 sm:grid-cols-2"><label class="rounded-lg border border-black/10 p-4 text-sm font-semibold">${firstLabel}<input class="mt-2 block w-full bg-transparent text-sm font-normal text-black/55 outline-none" value="${firstValue}" aria-label="${firstLabel}"></label><label class="rounded-lg border border-black/10 p-4 text-sm font-semibold">${secondLabel}<input class="mt-2 block w-full bg-transparent text-sm font-normal text-black/55 outline-none" value="${secondValue}" aria-label="${secondLabel}"></label></div><div class="mt-5 flex items-center justify-between rounded-lg bg-black/[.035] p-4"><span class="text-sm font-semibold">Changes save automatically</span><span class="inline-flex items-center gap-1 text-xs font-semibold text-[#48845a]"><i class="h-2 w-2 rounded-full bg-[#5eac72]"></i>Ready</span></div></div></div>`;
}

document.querySelectorAll("[data-settings-tab]").forEach((tab) =>
  tab.addEventListener("click", () => {
    activeSettingsTab = tab.dataset.settingsTab;
    activeSettingsChild = Object.keys(settingsContent[activeSettingsTab])[0];
    document.querySelectorAll("[data-settings-tab]").forEach((item) => {
      const active = item === tab;
      item.className = active ? "rounded-lg bg-plum px-4 py-2 text-sm font-semibold text-white" : "rounded-lg px-4 py-2 text-sm font-medium text-black/55 hover:bg-black/5";
      item.setAttribute("aria-selected", String(active));
    });
    renderSettings();
  }),
);
settingsPanel.addEventListener("click", (event) => {
  const child = event.target.closest("[data-settings-child]");
  if (!child) return;
  activeSettingsChild = child.dataset.settingsChild;
  renderSettings();
});
renderSettings();

const menuData = {
  Starters: [{ name: "Burrata", description: "Grilled peach, basil oil, sourdough.", price: "12.00", soldOut: false }, { name: "Cured sea trout", description: "Fennel, orange, creme fraiche.", price: "14.00", soldOut: false }, { name: "Whipped ricotta", description: "Charred grapes, hazelnut, focaccia.", price: "10.00", soldOut: true }],
  Mains: [{ name: "Sea bass", description: "Braised fennel, saffron potato, shellfish bisque.", price: "28.00", soldOut: false }, { name: "Rigatoni nduja", description: "Tomato, stracciatella, pangrattato.", price: "19.00", soldOut: false }],
  Desserts: [{ name: "Olive oil cake", description: "Yoghurt cream, summer berries.", price: "9.00", soldOut: false }],
  Drinks: [{ name: "House spritz", description: "Blood orange, prosecco, soda.", price: "12.00", soldOut: false }],
};
let activeCategory = "Starters";
let selectedProduct = menuData.Starters[0];

function renderMenuBuilder() {
  $("#menuCategories").innerHTML = Object.entries(menuData).map(([category, products]) => `<button class="menu-category w-full rounded-lg px-3 py-2 text-left text-sm ${category === activeCategory ? "bg-plum font-semibold text-white" : "font-medium text-black/60 hover:bg-black/5"}" data-category="${category}" type="button">${category}<span class="float-right font-[DM_Mono] text-xs ${category === activeCategory ? "text-lime" : ""}">${String(products.length).padStart(2, "0")}</span></button>`).join("");
  $("#menuCategoryLabel").textContent = activeCategory;
  $("#menuProductList").innerHTML = menuData[activeCategory].map((product, index) => `<div class="flex items-center gap-3 p-4 ${product === selectedProduct ? "bg-soft/25" : ""}"><button class="min-w-0 flex-1 text-left" data-product-index="${index}" type="button"><strong class="block text-sm ${product.soldOut ? "text-black/40 line-through" : ""}">${product.name}</strong><small class="mt-1 block truncate text-xs text-black/50">${product.description}</small></button><span class="font-[DM_Mono] text-xs ${product.soldOut ? "text-black/35" : ""}">£${product.price}</span><button class="rounded-md border px-2 py-1 font-[DM_Mono] text-[10px] font-bold ${product.soldOut ? "border-accent bg-accent text-white" : "border-black/10 text-black/55 hover:border-accent hover:text-accent"}" data-toggle-soldout="${index}" type="button">${product.soldOut ? "86'D" : "86"}</button></div>`).join("");
  $("#editorProductName").textContent = selectedProduct.name;
  $("#editorNameInput").value = selectedProduct.name;
  $("#editorDescriptionInput").value = selectedProduct.description;
  $("#editorPriceInput").value = selectedProduct.price;
  $("#previewProductName").innerHTML = `${selectedProduct.name}<span class="float-right">£${selectedProduct.price}</span>`;
  $("#previewProductDescription").textContent = selectedProduct.description;
}

$("#menuCategories").addEventListener("click", (event) => {
  const category = event.target.closest("[data-category]");
  if (!category) return;
  activeCategory = category.dataset.category;
  selectedProduct = menuData[activeCategory][0];
  renderMenuBuilder();
});
$("#menuProductList").addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-soldout]");
  if (toggle) {
    const product = menuData[activeCategory][Number(toggle.dataset.toggleSoldout)];
    product.soldOut = !product.soldOut;
    announce(`${product.name} marked ${product.soldOut ? "86'd" : "available"}.`);
    renderMenuBuilder();
    return;
  }
  const product = event.target.closest("[data-product-index]");
  if (!product) return;
  selectedProduct = menuData[activeCategory][Number(product.dataset.productIndex)];
  renderMenuBuilder();
});
$("#addCategory").addEventListener("click", () => {
  const input = $("#newCategoryName");
  const name = input.value.trim();
  if (!name || menuData[name]) return;
  menuData[name] = [];
  activeCategory = name;
  selectedProduct = { name: "New item", description: "Add a guest-facing description.", price: "0.00", soldOut: false };
  input.value = "";
  renderMenuBuilder();
});
$("#addProduct").addEventListener("click", () => {
  const input = $("#newProductName");
  const name = input.value.trim();
  if (!name) return;
  selectedProduct = { name, description: "Add a guest-facing description.", price: "0.00", soldOut: false };
  menuData[activeCategory].push(selectedProduct);
  input.value = "";
  renderMenuBuilder();
});
$("#saveMenuItem").addEventListener("click", () => {
  selectedProduct.name = $("#editorNameInput").value.trim() || selectedProduct.name;
  selectedProduct.description = $("#editorDescriptionInput").value.trim();
  selectedProduct.price = $("#editorPriceInput").value.trim() || selectedProduct.price;
  renderMenuBuilder();
  announce("Menu item saved.");
});
$("#menuPreview").addEventListener("click", () => announce(`Previewing the ${activeCategory.toLowerCase()} menu.`));
$("#publishMenu").addEventListener("click", () => announce("Menu changes published to live channels."));
renderMenuBuilder();
