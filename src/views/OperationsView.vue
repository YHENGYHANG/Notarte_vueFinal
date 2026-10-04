<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '../components/common/BaseIcon.vue'
import { useInventory } from '../composables/useInventory'
import { useAuth } from '../composables/useAuth'
import { formatCompactCurrency, formatNumber, timeAgo } from '../utils/format'
import { getStockStatus, STOCK_LABELS } from '../utils/stock'

const router = useRouter()
const { currentUser, can } = useAuth()
const { stats, items, categories, byCategory, attentionItems, activity } = useInventory()

const firstName = computed(() => currentUser.value?.name?.split(' ')[0] ?? 'there')

const health = computed(() => {
  if (!stats.value.skuCount) return 0
  return Math.round(((stats.value.skuCount - stats.value.lowCount - stats.value.outCount) / stats.value.skuCount) * 100)
})

const healthLabel = computed(() => {
  if (health.value >= 85) return 'Healthy'
  if (health.value >= 60) return 'Watch closely'
  return 'Needs attention'
})

const topCategories = computed(() =>
  [...byCategory.value].sort((a, b) => b.units - a.units).slice(0, 5),
)

const maxUnits = computed(() => Math.max(...topCategories.value.map((c) => c.units), 1))

const recentlyUpdated = computed(() =>
  [...items.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5),
)

function openItem(id) {
  router.push({ name: 'item-detail', params: { id } })
}

function goInventory(filter = '') {
  router.push({ name: 'inventory', query: filter ? { status: filter } : undefined })
}

</script>

<template>
  <div class="operations">
    <section class="hero">
      <div class="hero__copy">
        <span class="eyebrow"><BaseIcon name="dashboard" :size="15" /> Inventory workspace</span>
        <h1>Good {{ new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening' }}, {{ firstName }}.</h1>
        <p>Stay on top of stock, spot issues early, and keep your inventory moving.</p>
      </div>
      <div class="hero__actions">
        <RouterLink v-if="can('items:create')" :to="{ name: 'item-new' }" class="btn btn--primary">
          <BaseIcon name="plus" :size="18" /> Add item
        </RouterLink>
        <button type="button" class="btn btn--light" @click="goInventory()">
          <BaseIcon name="package" :size="18" /> View inventory
        </button>
      </div>
    </section>

    <section class="metric-grid" aria-label="Inventory summary">
      <article class="metric-card">
        <div class="metric-card__icon metric-card__icon--purple"><BaseIcon name="package" :size="20" /></div>
        <div><span>Products</span><strong>{{ formatNumber(stats.skuCount) }}</strong><small>active SKUs</small></div>
      </article>
      <article class="metric-card">
        <div class="metric-card__icon metric-card__icon--mint"><BaseIcon name="check" :size="20" /></div>
        <div><span>Units on hand</span><strong>{{ formatNumber(stats.unitCount) }}</strong><small>across all items</small></div>
      </article>
      <article class="metric-card">
        <div class="metric-card__icon metric-card__icon--blue"><BaseIcon name="tag" :size="20" /></div>
        <div><span>Stock value</span><strong>{{ formatCompactCurrency(stats.stockValue) }}</strong><small>current inventory value</small></div>
      </article>
      <article class="metric-card metric-card--alert" @click="goInventory('low')">
        <div class="metric-card__icon metric-card__icon--amber"><BaseIcon name="alert" :size="20" /></div>
        <div><span>Needs attention</span><strong>{{ stats.lowCount + stats.outCount }}</strong><small>{{ stats.outCount }} out of stock</small></div>
      </article>
    </section>

    <section class="workspace-grid">
      <article class="panel health-card">
        <div class="panel__head">
          <div>
            <span class="section-kicker">Stock health</span>
            <h2>{{ healthLabel }}</h2>
          </div>
          <div class="health-score">{{ health }}%</div>
        </div>
        <div class="health-ring" :style="{ '--health': `${health}%` }">
          <div><strong>{{ health }}%</strong><span>healthy</span></div>
        </div>
        <div class="health-legend">
          <button type="button" @click="goInventory('low')"><span class="dot dot--amber" /> {{ stats.lowCount }} low stock</button>
          <button type="button" @click="goInventory('out')"><span class="dot dot--red" /> {{ stats.outCount }} out of stock</button>
          <span><span class="dot dot--green" /> {{ Math.max(stats.skuCount - stats.lowCount - stats.outCount, 0) }} healthy</span>
        </div>
      </article>

      <article class="panel attention-card">
        <div class="panel__head">
          <div><span class="section-kicker">Priority queue</span><h2>Needs restocking</h2></div>
          <RouterLink :to="{ name: 'inventory' }" class="text-link">See all</RouterLink>
        </div>
        <div v-if="attentionItems.length" class="priority-list">
          <button v-for="item in attentionItems.slice(0, 4)" :key="item.id" type="button" class="priority-row" @click="openItem(item.id)">
            <div class="priority-row__icon"><BaseIcon name="package" :size="17" /></div>
            <div class="priority-row__main"><strong>{{ item.name }}</strong><span>{{ item.quantity }} left · minimum {{ item.minStock }}</span></div>
            <span class="badge" :class="`badge--${getStockStatus(item)}`">{{ STOCK_LABELS[getStockStatus(item)] }}</span>
          </button>
        </div>
        <div v-else class="success-state"><BaseIcon name="check" :size="22" /><strong>Everything is stocked</strong><span>No items need immediate attention.</span></div>
      </article>
    </section>

    <section class="workspace-grid workspace-grid--wide">
      <article class="panel">
        <div class="panel__head">
          <div><span class="section-kicker">Distribution</span><h2>Inventory by category</h2></div>
          <RouterLink :to="{ name: 'categories' }" v-if="can('categories:manage')" class="text-link">Manage</RouterLink>
        </div>
        <div class="category-list">
          <div v-for="category in topCategories" :key="category.id" class="category-row">
            <div class="category-row__top"><span><i :style="{ background: category.color }" />{{ category.name }}</span><strong>{{ formatNumber(category.units) }}</strong></div>
            <div class="progress"><span :style="{ width: `${(category.units / maxUnits) * 100}%`, background: category.color }" /></div>
            <small>{{ category.skuCount }} product{{ category.skuCount === 1 ? '' : 's' }}</small>
          </div>
          <div v-if="!topCategories.length" class="empty-mini">Create a category to start organizing inventory.</div>
        </div>
      </article>

      <article class="panel">
        <div class="panel__head"><div><span class="section-kicker">Timeline</span><h2>Recent activity</h2></div></div>
        <ol v-if="activity.length" class="activity-list">
          <li v-for="entry in activity.slice(0, 6)" :key="entry.id">
            <span class="activity-dot" />
            <div><strong>{{ entry.message }}</strong><small>{{ entry.actor }} · {{ timeAgo(entry.at) }}</small></div>
          </li>
        </ol>
        <div v-else class="empty-mini">Your inventory changes will appear here.</div>
      </article>
    </section>

    <section class="panel updates-panel">
      <div class="panel__head"><div><span class="section-kicker">Recently touched</span><h2>Latest inventory updates</h2></div><RouterLink :to="{ name: 'inventory' }" class="text-link">Open inventory</RouterLink></div>
      <div class="updates-grid">
        <button v-for="item in recentlyUpdated" :key="item.id" type="button" class="update-card" @click="openItem(item.id)">
          <span class="update-card__sku">{{ item.sku }}</span>
          <strong>{{ item.name }}</strong>
          <span>{{ formatNumber(item.quantity) }} units · {{ formatCompactCurrency(item.price) }}</span>
        </button>
        <div v-if="!recentlyUpdated.length" class="empty-mini">No inventory items yet.</div>
      </div>
    </section>

    <section v-if="can('users:manage')" class="admin-strip">
      <div><div class="admin-strip__icon"><BaseIcon name="shield" :size="19" /></div><div><strong>Administration</strong><span>Manage team access and keep your catalog organized.</span></div></div>
      <div class="admin-strip__actions">
        <RouterLink :to="{ name: 'categories' }" class="btn btn--light">Categories</RouterLink>
        <RouterLink :to="{ name: 'users' }" class="btn btn--light">Users</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.operations { display: grid; gap: 1.15rem; }
.hero { display:flex; align-items:flex-end; justify-content:space-between; gap:1.5rem; padding:clamp(1.35rem,3vw,2rem); border-radius:22px; background:linear-gradient(135deg,#151b38 0%,#2b3270 62%,#4c5dd9 100%); color:#fff; overflow:hidden; position:relative; box-shadow:0 16px 38px rgb(40 47 105 / .18); }
.hero::after { content:""; position:absolute; width:220px; height:220px; border:35px solid rgb(255 255 255 / .08); border-radius:50%; right:-55px; top:-80px; }
.hero__copy,.hero__actions { position:relative; z-index:1; }
.eyebrow,.section-kicker { text-transform:uppercase; letter-spacing:.1em; font-size:.72rem; font-weight:700; }
.eyebrow { display:inline-flex; align-items:center; gap:.4rem; color:#cbd2ff; margin-bottom:.55rem; }
.hero h1 { font-size:clamp(1.8rem,2.8vw,2.7rem); max-width:18ch; }
.hero p { color:#d8dcf4; max-width:55ch; margin-top:.55rem; }
.hero__actions { display:flex; gap:.55rem; flex-wrap:wrap; }
.btn--light { background:rgb(255 255 255 / .11); border-color:rgb(255 255 255 / .2); color:#fff; backdrop-filter:blur(8px); }
.btn--light:hover { background:rgb(255 255 255 / .18); border-color:rgb(255 255 255 / .3); }
.metric-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1rem; }
.metric-card { display:flex; align-items:center; gap:.85rem; padding:1rem; background:var(--surface); border:1px solid var(--line); border-radius:16px; box-shadow:var(--shadow-sm); min-width:0; }
.metric-card--alert { cursor:pointer; transition:transform .15s,box-shadow .15s; }
.metric-card--alert:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
.metric-card__icon { width:2.65rem; height:2.65rem; border-radius:12px; display:grid; place-items:center; flex:none; }
.metric-card__icon--purple { background:#eeecff; color:#635bff; }.metric-card__icon--mint{background:#e1f8f2;color:#079c7d}.metric-card__icon--blue{background:#e7f0ff;color:#3f75df}.metric-card__icon--amber{background:#fff1d2;color:#b97500}
.metric-card span,.metric-card small { display:block; color:var(--ink-mute); font-size:.78rem; }
.metric-card strong { display:block; font-family:var(--font-display); font-size:1.45rem; line-height:1.2; margin:.12rem 0; }
.workspace-grid { display:grid; grid-template-columns:minmax(0,.85fr) minmax(0,1.5fr); gap:1rem; }
.workspace-grid--wide { grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr); }
.panel { box-shadow:var(--shadow-sm); overflow:hidden; }
.panel__head { padding:1rem 1.15rem; }
.panel__head h2 { margin-top:.15rem; }
.section-kicker { color:var(--primary); }
.text-link { color:var(--primary); font-size:.86rem; font-weight:650; text-decoration:none; }.text-link:hover{text-decoration:underline}
.health-card { padding-bottom:1rem; }
.health-score { font-family:var(--font-display); font-weight:700; font-size:1.25rem; color:var(--primary); }
.health-ring { width:150px; height:150px; border-radius:50%; margin:1rem auto; display:grid; place-items:center; background:conic-gradient(var(--primary) var(--health), #edf0f5 0); position:relative; }
.health-ring::after { content:""; position:absolute; inset:12px; border-radius:50%; background:var(--surface); }
.health-ring div { position:relative; z-index:1; text-align:center; }.health-ring strong{display:block;font:700 2rem/1 var(--font-display)}.health-ring span{font-size:.75rem;color:var(--ink-mute)}
.health-legend { display:grid; grid-template-columns:repeat(3,1fr); gap:.4rem; padding:0 1rem; }.health-legend button,.health-legend>span{border:0;background:transparent;color:var(--ink-soft);font:inherit;font-size:.78rem;text-align:left;padding:0;}.health-legend button{cursor:pointer}.health-legend button:hover{color:var(--ink)}
.dot{display:inline-block;width:.5rem;height:.5rem;border-radius:50%;margin-right:.25rem}.dot--amber{background:#e4a11b}.dot--red{background:#e05252}.dot--green{background:#2ca66f}
.priority-list { padding:.25rem .5rem .55rem; }.priority-row{width:100%;display:flex;align-items:center;gap:.75rem;padding:.7rem;border:0;background:transparent;text-align:left;border-radius:10px;cursor:pointer}.priority-row:hover{background:var(--surface-2)}.priority-row__icon{width:2rem;height:2rem;border-radius:9px;display:grid;place-items:center;background:#f0efff;color:var(--primary);flex:none}.priority-row__main{flex:1;min-width:0}.priority-row__main strong,.priority-row__main span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.priority-row__main span{font-size:.78rem;color:var(--ink-mute);margin-top:.1rem}
.success-state{min-height:190px;display:grid;place-items:center;text-align:center;align-content:center;gap:.25rem;color:var(--ok);padding:1.5rem}.success-state span{color:var(--ink-mute);font-size:.85rem}
.category-list{padding:1rem 1.15rem;display:grid;gap:1rem}.category-row__top{display:flex;justify-content:space-between;gap:1rem;font-size:.88rem}.category-row__top span{display:flex;align-items:center;gap:.45rem}.category-row__top i{width:.55rem;height:.55rem;border-radius:50%}.progress{height:.45rem;background:#edf0f5;border-radius:99px;overflow:hidden;margin:.35rem 0 .25rem}.progress span{display:block;height:100%;border-radius:99px}.category-row small{color:var(--ink-mute);font-size:.75rem}
.activity-list{list-style:none;padding:.45rem 1.15rem 1rem;margin:0;display:grid}.activity-list li{display:flex;gap:.7rem;padding:.55rem 0;border-bottom:1px solid var(--line)}.activity-list li:last-child{border-bottom:0}.activity-dot{width:.5rem;height:.5rem;border-radius:50%;background:var(--primary);margin-top:.4rem;flex:none}.activity-list strong,.activity-list small{display:block;font-size:.82rem}.activity-list small{color:var(--ink-mute);margin-top:.08rem}
.updates-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.75rem;padding:1rem 1.15rem}.update-card{border:1px solid var(--line);background:var(--surface-2);border-radius:12px;padding:.8rem;text-align:left;cursor:pointer;min-width:0}.update-card:hover{border-color:#c6c2ff;transform:translateY(-1px)}.update-card__sku{font-size:.68rem;color:var(--primary);font-weight:700;letter-spacing:.06em}.update-card strong,.update-card span:last-child{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.update-card strong{margin:.25rem 0;font-size:.9rem}.update-card span:last-child{font-size:.75rem;color:var(--ink-mute)}
.empty-mini{padding:1.4rem;color:var(--ink-mute);font-size:.88rem;text-align:center}
.admin-strip{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 1.15rem;border:1px solid #dcd9ff;background:#f5f4ff;border-radius:16px}.admin-strip>div:first-child{display:flex;align-items:center;gap:.7rem}.admin-strip__icon{width:2.3rem;height:2.3rem;display:grid;place-items:center;border-radius:10px;background:#e7e5ff;color:var(--primary)}.admin-strip strong,.admin-strip span{display:block}.admin-strip span{font-size:.8rem;color:var(--ink-mute)}.admin-strip__actions{display:flex;gap:.45rem}
@media(max-width:65em){.metric-grid{grid-template-columns:repeat(2,1fr)}.workspace-grid,.workspace-grid--wide{grid-template-columns:1fr}.updates-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:42em){.hero{align-items:flex-start;flex-direction:column}.metric-grid{grid-template-columns:1fr}.health-legend{grid-template-columns:1fr}.updates-grid{grid-template-columns:1fr 1fr}.admin-strip{align-items:flex-start;flex-direction:column}.admin-strip__actions{width:100%}}
@media(max-width:30em){.updates-grid{grid-template-columns:1fr}}
</style>
