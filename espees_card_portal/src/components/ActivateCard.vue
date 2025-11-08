<template>
  <div class="form-section" style="overflow:auto">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">Activate Your Card</h2>
      <button class="btn btn-outline-primary" @click="navigate('home')">
        <i class="fas fa-arrow-left me-2"></i>Back to Home
      </button>
    </div>
    
    <div class="row">
      <div class="col-md-6">
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="cardId" class="form-label fw-semibold">Card ID</label>
            <input 
              type="text" 
              class="form-control form-control-lg" 
              id="cardId" 
              v-model="formData.card_id" 
              placeholder="Enter your 16-digit card ID" 
              required
              pattern="[0-9]{16}"
              maxlength="16"
            >
            <div class="form-text">Enter your 16-digit card number</div>
          </div>
          <div class="mb-4">
            <label for="cardId" class="form-label fw-semibold">Username/Email</label>
            <input 
              type="text" 
              class="form-control form-control-lg" 
              id="userEmail" 
              v-model="formData.card_email" 
              placeholder="Enter username / email" 
              required
            >
          <div class="form-text">Enter your kingschat username or an email</div>
          </div>
          <div class="mb-4">
           <div class="text-center">
             <label class="form-label fw-semibold">PIN</label>
           </div>
            <div class="pin-boxes">
              <input 
                v-for="(digit, index) in pinDigits" 
                :key="index"
                type="password" 
                class="pin-box" 
                maxlength="1" 
                v-model="pinDigits[index]" 
                @input="focusNext(index, $event)" 
                @keydown="handlePinKeydown(index, $event)"
                ref="pinInputs"
                pattern="[0-9]"
                inputmode="numeric"
              >
            </div>
            <div class="form-text text-center">Enter your 4-digit PIN</div>
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || !isFormValid">
              <span v-if="loading" class="loading-spinner me-2"></span>
              {{ loading ? 'Activating...' : 'Activate Card' }}
            </button>
          </div>
        </form>
        
        <div v-if="message" :class="['alert mt-4', messageType === 'success' ? 'alert-success' : 'alert-danger']">
          {{ message }}
        </div>
      </div>
      
      <div class="col-md-6">
        <CardVisualization class="h-100 d-flex flex-column justify-content-center" />
      </div>
    </div>
  </div>
</template>

<script>
import CardVisualization from './CardVisualization.vue'

export default {
  name: 'ActivateCard',
  components: {
    CardVisualization
  },
  props: {
    loading: Boolean,
    message: String,
    messageType: String
  },
  data() {
    return {
      formData: {
        card_id: '',
        crdpn: ''
      },
      pinDigits: ['', '', '', '']
    }
  },
  computed: {
    isFormValid() {
      return this.formData.card_id.length === 16 && this.formData.crdpn.length === 4
    }
  },
  watch: {
    pinDigits: {
      handler(newDigits) {
        this.formData.crdpn = newDigits.join('')
      },
      deep: true
    }
  },
  methods: {
    navigate(page) {
      this.$emit('navigate', page)
    },
    focusNext(index, event) {
      const value = event.target.value
      if (value && /[0-9]/.test(value) && index < 3) {
        this.$refs.pinInputs[index + 1].focus()
      }
    },
    handlePinKeydown(index, event) {
      if (event.key === 'Backspace' && !event.target.value && index > 0) {
        this.$refs.pinInputs[index - 1].focus()
      }
      
      // Allow only numbers
      if (!/[0-9]/.test(event.key) && 
          event.key !== 'Backspace' && 
          event.key !== 'Delete' && 
          event.key !== 'Tab' && 
          !event.ctrlKey && 
          !event.metaKey) {
        event.preventDefault()
      }
    },
    submitForm() {
      if (this.isFormValid) {
        this.$emit('submit-form', {
          type: 'activation',
          data: this.formData
        })
      }
    }
  }
}
</script>