(() => {
  let filter = "all";
  let currentPage = 1;
  const pageSize = 4;
  let nextOrderNumber = 1051;
  let incomingOrder;
  let incomingTimer;
  let lifecycleTimer;
  const modal = document.querySelector("#incomingOrderModal");
  const mobileOrders = [
    { guest: "Maya Chen", initials: "MC", channel: "Delivery", items: [["Aubergine schnitzel", "£16.00"], ["Heritage tomato salad", "£8.00"], ["Lemonade ×2", "£7.00"]], total: "£31.00" },
    { guest: "Owen Reid", initials: "OR", channel: "Pickup", items: [["Chicken caesar", "£15.00"], ["Rosemary fries", "£5.00"], ["Still water", "£3.00"]], total: "£23.00" },
    { guest: "Priya Shah", initials: "PS", channel: "Delivery", items: [["Sea bass", "£28.00"], ["Tenderstem broccoli", "£6.00"], ["Sparkling water", "£4.00"]], total: "£38.00" },
  ];
  const statusCopy = { preparing: { label: "Preparing", tone: "text-[#9a6b18]", dot: "bg-[#d6a72c]" }, pickup: { label: "Awaiting pickup", tone: "text-[#48845a]", dot: "bg-[#5eac72]" }, delivery: { label: "On delivery", tone: "text-[#594a94]", dot: "bg-[#7e6eb5]" }, completed: { label: "Completed", tone: "text-black/45", dot: "bg-black/35" } };
  const isOrdersRoute = () => window.location.hash === "#orders";

  function updateOrders() {
    const term = document.querySelector("#orderSearch").value.toLowerCase();
    const source = document.querySelector("#sourceFilter").value;
    const rows = [...document.querySelectorAll(".order-row")];
    const filtered = rows.filter((row) => (filter === "all" || row.dataset.status === filter) && (source === "all" || row.dataset.channel === source) && row.dataset.search.includes(term));
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    rows.forEach((row) => row.classList.toggle("hidden", !filtered.slice(start, start + pageSize).includes(row)));
    document.querySelector("#emptyOrders").classList.toggle("hidden", filtered.length > 0);
    document.querySelector("#pageSummary").textContent = filtered.length ? `${start + 1}-${Math.min(start + pageSize, filtered.length)} of ${filtered.length} orders` : "0 orders";
    document.querySelector("#previousPage").disabled = currentPage === 1;
    document.querySelector("#nextPage").disabled = currentPage === totalPages;
    document.querySelector("#pageButtons").innerHTML = Array.from({ length: totalPages }, (_, index) => `<button class="grid h-8 min-w-8 place-items-center rounded-md px-2 ${index + 1 === currentPage ? "bg-plum text-white" : "hover:bg-black/5"}" data-page="${index + 1}" type="button">${index + 1}</button>`).join("");
    document.querySelectorAll("#pageButtons button").forEach((button) => button.addEventListener("click", () => { currentPage = Number(button.dataset.page); updateOrders(); }));
  }
  function closeIncomingOrder() { modal.classList.replace("flex", "hidden"); }
  function showIncomingOrder() {
    if (!isOrdersRoute() || !modal.classList.contains("hidden")) return;
    incomingOrder = { ...mobileOrders[nextOrderNumber % mobileOrders.length], id: nextOrderNumber++ };
    document.querySelector("#incomingOrderTitle").textContent = `Order #${incomingOrder.id}`;
    document.querySelector("#incomingInitials").textContent = incomingOrder.initials;
    document.querySelector("#incomingGuest").textContent = incomingOrder.guest;
    document.querySelector("#incomingChannel").textContent = `OrderPortal mobile app · ${incomingOrder.channel}`;
    document.querySelector("#incomingFulfilment").textContent = `${incomingOrder.channel} · as soon as possible`;
    document.querySelector("#incomingItems").innerHTML = `${incomingOrder.items.map(([item, price]) => `<div class="flex justify-between"><span>${item}</span><strong>${price}</strong></div>`).join("")}<div class="flex justify-between border-t border-black/10 pt-3 font-bold"><span>Total</span><span>${incomingOrder.total}</span></div>`;
    modal.classList.replace("hidden", "flex");
    document.querySelector("#acceptOrder").focus();
  }
  function addAcceptedOrder() {
    const preparationMinutes = 10 + Math.floor(Math.random() * 11);
    const row = document.createElement("button");
    row.type = "button"; row.className = "order-row grid w-full grid-cols-[42px_1fr_auto] items-center gap-3 p-4 text-left hover:bg-black/[.025]";
    row.dataset.status = "preparing"; row.dataset.channel = incomingOrder.channel.toLowerCase(); row.dataset.fulfilment = row.dataset.channel;
    row.dataset.search = `${incomingOrder.id} ${incomingOrder.channel} ${incomingOrder.guest} ${incomingOrder.items.map(([item]) => item).join(" ")}`.toLowerCase();
    row.dataset.prepEnds = String(Date.now() + preparationMinutes * 60000); row.dataset.nextStage = String(Date.now() + (preparationMinutes + 10) * 60000); row.dataset.completeAt = String(Date.now() + (preparationMinutes + 25) * 60000);
    row.innerHTML = `<span class="grid h-10 w-10 place-items-center rounded-lg bg-soft font-[DM_Mono] text-xs font-bold text-accent">#${String(incomingOrder.id).slice(-2)}</span><span><strong class="block text-sm">${incomingOrder.channel} <span class="ml-1 font-normal text-black/45">· ${incomingOrder.guest}</span></strong><small class="mt-1 block text-xs text-black/50">${incomingOrder.items.map(([item]) => item).join(", ")}</small></span><span class="text-right"><b class="order-time block font-[DM_Mono] text-xs text-accent">${preparationMinutes} min left</b><small class="order-status mt-1 inline-flex items-center gap-1 text-[11px] text-[#9a6b18]"><i class="h-1.5 w-1.5 rounded-full bg-[#d6a72c]"></i>Preparing</small></span>`;
    document.querySelector("#orderList").prepend(row); closeIncomingOrder(); updateOrders();
  }
  function updateLifecycle() {
    const now = Date.now();
    document.querySelectorAll(".order-row[data-prep-ends]").forEach((row) => {
      const state = now >= Number(row.dataset.completeAt) ? "completed" : now >= Number(row.dataset.nextStage) ? (row.dataset.fulfilment === "delivery" ? "delivery" : "completed") : now >= Number(row.dataset.prepEnds) ? "pickup" : "preparing";
      row.dataset.status = state; const copy = statusCopy[state]; const time = row.querySelector(".order-time"); const status = row.querySelector(".order-status");
      time.textContent = state === "preparing" ? `${Math.max(0, Math.ceil((Number(row.dataset.prepEnds) - now) / 60000))} min left` : state === "pickup" ? "Ready" : copy.label;
      status.className = `order-status mt-1 inline-flex items-center gap-1 text-[11px] ${copy.tone}`; status.innerHTML = `<i class="h-1.5 w-1.5 rounded-full ${copy.dot}"></i>${copy.label}`;
    });
    updateOrders();
  }
  document.querySelectorAll("#orderTabs button").forEach((button) => button.addEventListener("click", () => { filter = button.dataset.filter; currentPage = 1; document.querySelectorAll("#orderTabs button").forEach((tab) => tab.className = "rounded-md px-3 py-1.5 text-black/55"); button.className = "rounded-md bg-paper px-3 py-1.5 font-semibold text-ink shadow-sm"; updateOrders(); }));
  document.querySelector("#orderSearch").addEventListener("input", () => { currentPage = 1; updateOrders(); });
  document.querySelector("#sourceFilter").addEventListener("change", () => { currentPage = 1; updateOrders(); });
  document.querySelector("#clearFilters").addEventListener("click", () => { filter = "all"; currentPage = 1; document.querySelector("#sourceFilter").value = "all"; document.querySelector("#orderSearch").value = ""; document.querySelectorAll("#orderTabs button").forEach((tab) => tab.className = "rounded-md px-3 py-1.5 text-black/55"); document.querySelector('#orderTabs [data-filter="all"]').className = "rounded-md bg-paper px-3 py-1.5 font-semibold text-ink shadow-sm"; updateOrders(); });
  document.querySelector("#previousPage").addEventListener("click", () => { currentPage -= 1; updateOrders(); });
  document.querySelector("#nextPage").addEventListener("click", () => { currentPage += 1; updateOrders(); });
  document.querySelector("#acceptOrder").addEventListener("click", addAcceptedOrder);
  ["#declineOrder", "#rejectOrder"].forEach((selector) => document.querySelector(selector).addEventListener("click", closeIncomingOrder));
  document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && isOrdersRoute()) { event.preventDefault(); document.querySelector("#orderSearch").focus(); } });
  window.addEventListener("orderportal:route", (event) => { if (event.detail === "orders") { updateOrders(); incomingTimer ??= setTimeout(showIncomingOrder, 5000); lifecycleTimer ??= setInterval(updateLifecycle, 1000); } else closeIncomingOrder(); });
  updateOrders();
  if (isOrdersRoute()) {
    incomingTimer = setTimeout(showIncomingOrder, 5000);
    lifecycleTimer = setInterval(updateLifecycle, 1000);
  }
})();
