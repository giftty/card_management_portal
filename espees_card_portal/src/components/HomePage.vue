<template>
  
  <div class="form-section">
    <div class="row text-center mb-5">
      <div class="col-md-8 mx-auto">
        <h2 class="fw-bold mb-4">What would you like to do today?</h2>
        <p class="text-muted">Select an option below to manage your card</p>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-4">
        <div class="d-grid">
          <button class="btn btn-portal btn-activate" @click="navigate('activate')">
            <i class="fas fa-unlock-alt "></i>
            Activate Card
          </button>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-grid">
          <button class="btn btn-portal btn-change" @click="navigate('changePin')">
            <i class="fas fa-key"></i>
            Change Card PIN
          </button>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-grid">
          <button class="btn btn-portal btn-transactions" @click="navigate('transactions')">
            <i class="fas fa-receipt"></i>
            View Transactions
          </button>
        </div>
      </div>
    </div>
    
    <!-- Card Visualization -->
    <CardVisualization class="mt-5" />
  </div>
</template>

<script>
import CardVisualization from './CardVisualization.vue'

export default {
  name: 'HomePage',
  components: {
    CardVisualization
  },
  methods: {
    navigate(page) {
      this.$emit('navigate', page)
    }
  }
}
</script>