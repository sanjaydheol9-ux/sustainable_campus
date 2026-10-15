<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome to the Sustainable Campus Dashboard.</p>

    <div class="kpi-strip">
      <div class="kpi-item">
        <div class="kpi-value">85%</div>
        <div class="kpi-label">Energy Savings</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-value">12 L</div>
        <div class="kpi-label">Water Flow</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-value">34 kg</div>
        <div class="kpi-label">Waste Collected</div>
      </div>
    </div>

    <div class="map-container card">
      <!-- Placeholder SVG map -->
      <svg viewBox="0 0 200 200" class="zone">
        <circle cx="100" cy="100" r="80" fill="var(--color-muted)" />
      </svg>
    </div>
  </div>
</template>

<script setup>
// Future: fetch real metrics via API
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}
.dashboard h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: hsl(210, 60%, 20%);
}
.kpi-strip {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}
.kpi-item {
  flex: 1;
  text-align: center;
}
.kpi-value {
  font-size: 1.5rem;
  font-weight: bold;
}
.kpi-label {
  font-size: 0.9rem;
  opacity: 0.8;
}
.map-container {
  margin-top: 1rem;
}
</style>
