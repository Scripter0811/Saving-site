const $ = (id) => document.getElementById(id);
const targets = { you: 1750, friend: 800, total: 2550 };
let current = { you_saved: 0, friend_saved: 0 };

function money(n) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);
}
function percent(n, target) { return Math.min(100, Math.round((n / target) * 100)); }
function render() {
  const you = Number(current.you_saved) || 0;
  const friend = Number(current.friend_saved) || 0;
  const total = you + friend;
  $("totalSaved").innerHTML = `${money(total)} <small>saved together</small>`;
  $("overallBar").style.width = `${percent(total, targets.total)}%`;
  $("overallPercent").textContent = `${percent(total, targets.total)}% saved`;
  $("remaining").textContent = `${money(Math.max(0, targets.total - total))} left`;
  $("youAmount").innerHTML = `${money(you)} <small>/ ${money(targets.you)}</small>`;
  $("youBar").style.width = `${percent(you, targets.you)}%`;
  $("youPct").textContent = `${percent(you, targets.you)}%`;
  $("friendAmount").innerHTML = `${money(friend)} <small>/ ${money(targets.friend)}</small>`;
  $("friendBar").style.width = `${percent(friend, targets.friend)}%`;
  $("friendPct").textContent = `${percent(friend, targets.friend)}%`;
  $("youInput").value = you;
  $("friendInput").value = friend;
}
async function loadState() {
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load shared savings.");
    current = await res.json();
    render();
    $("status").textContent = "Shared tracker is up to date.";
  } catch (e) {
    $("status").textContent = "Couldn't connect yet. Check your Vercel and Supabase setup.";
  }
}
async function save(which) {
  const input = which === "you" ? $("youInput") : $("friendInput");
  const amount = Number(input.value);
  const max = which === "you" ? targets.you : targets.friend;
  if (!Number.isFinite(amount) || amount < 0 || amount > max) {
    $("status").textContent = `Enter an amount from $0 to ${money(max)}.`;
    return;
  }
  const pin = window.prompt("Enter the shared trip PIN to save your update:");
  if (!pin) return;
  const button = which === "you" ? $("saveYou") : $("saveFriend");
  button.disabled = true;
  $("status").textContent = "Saving to the shared tracker…";
  try {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person: which, amount, pin })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Save failed.");
    current = data;
    render();
    $("status").textContent = "Saved! Your friend will see the updated total when they open or refresh the site.";
  } catch (e) {
    $("status").textContent = e.message;
  } finally {
    button.disabled = false;
  }
}
$("saveYou").addEventListener("click", () => save("you"));
$("saveFriend").addEventListener("click", () => save("friend"));
loadState();
