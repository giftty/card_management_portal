<template>
  <div class="form-section">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">Card Transactions</h2>
      <button class="btn btn-outline-primary" @click="navigate('home')">
        <i class="fas fa-arrow-left me-2"></i>Back to Home
      </button>
    </div>
    
    <div class="row">
      <div class="col-md-5">
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="transactionCardId" class="form-label fw-semibold">Card ID</label>
            <input 
              type="text" 
              class="form-control form-control-lg" 
              id="transactionCardId" 
              v-model="formData.card_id" 
              placeholder="Enter your 16-digit card ID" 
              required
              pattern="[0-9]{16}"
              maxlength="16"
            >
            <div class="form-text">Enter your 16-digit card number</div>
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || !isFormValid">
              <span v-if="loading" class="loading-spinner me-2"></span>
              {{ loading ? 'Loading...' : 'View Transactions' }}
            </button>
          </div>
        </form>
        
        <div v-if="message" :class="['alert mt-4', messageType === 'success' ? 'alert-success' : 'alert-danger']">
          {{ message }}
        </div>
      </div>
      
      <div class="col-md-7">
        <CardVisualization class="mb-4" />
        
        <!-- Display API Response Data -->
        <div v-if="apiResponse">
          <h4 class="fw-bold mb-3">Card Information</h4>
          
          <!-- Balance Information -->
          <div class="balance-section mb-4">
            <div class="card bg-light border-0 p-3">
              <div class="row text-center">
                <div class="col-6">
                  <h6 class="text-muted mb-1">Available Balance</h6>
                  <h4 class="text-success fw-bold">
                    {{ formatCurrency(apiResponse.balance || apiResponse.available_balance) }}
                  </h4>
                </div>
                <div class="col-6">
                  <h6 class="text-muted mb-1">Card Status</h6>
                  <h4 :class="['fw-bold', getStatusClass('active')]">
                    active
                  </h4>
                </div>
              </div>
              
              <!-- Additional API Data -->
              <div class="row mt-3 text-center">
                <div class="col-12">
                  <small class="text-muted">
                    Card: {{ formData.card_id }} | 
                    Currency: {{ apiResponse.currency || 'Espees' }}
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Transactions List -->
          <div v-if="hasTransactions">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Recent Transactions</h5>
              <span class="badge bg-primary">
                {{ transactionCount }} transactions
              </span>
            </div>
            
            <div class="transaction-list">
              <div 
                v-for="(transaction, index) in transactions" 
                :key="index" 
                class="transaction-item"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">{{ getTransactionDescription(transaction) }}</h6>
                    <div class="d-flex align-items-center">
                      <small class="text-muted me-3">
                        <i class="fas fa-calendar me-1"></i>
                        {{ formatDate(transaction.date || transaction.time) }}
                      </small>
                      <small class="text-muted">
                        <i class="fas fa-tag me-1"></i>
                        {{ transaction.event }}
                      </small>
                    </div>
                    <small v-if="transaction.narrative" class="text-muted">
                      <i class="fas fa-map-marker-alt me-1"></i>
                      {{ transaction.narrative }}
                    </small>
                  </div>
                  <div :class="['transaction-amount',transaction.event=='debit'?'negative':'positive']">
                    {{ getAmountPrefix(transaction.amount) }}{{ formatCurrency(Math.abs(transaction.amount)) }}
                  </div>
                </div>
                
                <!-- Transaction ID if available -->
                <div v-if="transaction.id || transaction.transaction_id" class="mt-2">
                  <small class="text-muted">
                    Transaction ID: {{ transaction.id || transaction.transaction_id }}
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Transactions Message -->
          <div v-else class="text-center py-4">
            <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
            <p class="text-muted">No transactions found for this card.</p>
          </div>
          
        </div>
        
        <!-- Initial State -->
        <div v-else class="text-center py-4">
          <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
          <p class="text-muted">Enter your card ID to view transactions and balance information.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CardVisualization from './CardVisualization.vue'

export default {
  name: 'Transactions',
  components: {
    CardVisualization
  },
  props: {
    loading: Boolean,
    message: String,
    messageType: String,
    transactionData: Object // This is passed from App.vue
  },
  data() {
    return {
      formData: {
        card_id: ''
      },
      showDebug: false,
      localTransactionData: null
    }
  },
  computed: {
    isFormValid() {
      return this.formData.card_id.length === 16
    },
    
    // Use either the prop data or local data
    apiResponse() {
      if(this.transactionData==null)
       return []
      return {
        card_id: this.formData.card_id,
        balance: this.transactionData.balance.body.balance,
        currency: 'Espees',
        status: 'active',
        transactions: this.transactionData.transactions.body
      }
      },
    
    // Get transactions array from API response
    transactions() {
      if (!this.apiResponse) return []
      
      // Handle different possible response structures
      return this.apiResponse.transactions || 
             this.apiResponse.transaction_history || 
             this.apiResponse.data?.transactions || 
             []
    },
    
    // Check if we have transactions
    hasTransactions() {
      return this.transactions.length > 0
    },
    
    // Count transactions
    transactionCount() {
      return this.transactions.length
    }
  },
  watch: {
    // Watch for when transactionData prop changes (from API response)
    transactionData: {
      handler(newData) {
        if (newData) {
          console.log('Received transaction data from parent:', newData)
          console.log('-----------------')
          console.log(this.transactionData.balance.body.balance)
          // this.localTransactionData = null // Clear local data when we get data from parent
        }
      },
      immediate: true
    },
    
    // Watch for success messages to handle local data simulation
    messageType(newType) {
      if (newType === 'success' && !this.transactionData) {
        
        // If we don't have data from the API yet, use simulated data
        // This will be replaced by real API data when the proxy is working
        //this.localTransactionData = this.getSimulatedData()
       // console.log('Using simulated transaction data:', this.localTransactionData)
      }
    }
  },
  methods: {
    navigate(page) {
      this.$emit('navigate', page)
    },
    
    submitForm() {
      if (this.isFormValid) {
        this.$emit('submit-form', {
          type: 'transactions',
          data: this.formData
        })
      }
    },
    
   
    
    // Format currency amount
     formatCurrency(amount) {
    if (amount === undefined || amount === null) return 'Espees 0.00'
    
    const absoluteAmount = Math.abs(amount)
    const isNegative = amount < 0
    
    const formattedAmount = absoluteAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    
    return `${isNegative ? '-' : ''}Espees ${formattedAmount}`
  },
    
    // Format date
    formatDate(dateString) {
      if (!dateString) return ' '
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return dateString
      }
    },
    
    // Get status class for styling
    getStatusClass(status) {
      const statusMap = {
        'active': 'text-success',
        'inactive': 'text-warning',
        'suspended': 'text-danger',
        'blocked': 'text-danger'
      }
      return statusMap[status] || 'text-secondary'
    },
    
    // Format status for display
    formatStatus(status) {
      if (!status) return 'Unknown'
      return status.charAt(0).toUpperCase() + status.slice(1)
    },
    
    // Get transaction description from various possible fields
    getTransactionDescription(transaction) {
      return transaction.description || 
             transaction.merchant || 
             transaction.narrative || 
             'Transaction'
    },
    
    // Get CSS class for amount
    getAmountClass(amount) {
      return amount >= 0 ? 'positive' : 'negative'
    },
    
    // Get prefix for amount display
    getAmountPrefix(amount) {
      return amount >= 0 ? '+' : ''
    }
  }
}
</script>