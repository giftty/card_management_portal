<template>
  <div class="form-section">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">Change Card PIN</h2>
      <button class="btn btn-outline-primary" @click="navigate('home')">
        <i class="fas fa-arrow-left me-2"></i>Back to Home
      </button>
    </div>
    
    <div class="row">
      <div class="col-md-6">
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="changeCardId" class="form-label fw-semibold">Card ID</label>
            <input 
              type="text" 
              class="form-control form-control-lg" 
              id="changeCardId" 
              v-model="formData.card_id" 
              placeholder="Enter your 16-digit card ID" 
              required
              pattern="[0-9]{16}"
              maxlength="16"
            >
            <div class="form-text">Enter your 16-digit card number</div>
          </div>
          
          <div class="mb-4">
            <label class="form-label fw-semibold">New PIN</label>
            <div class="pin-boxes">
              <input 
                v-for="(digit, index) in newPinDigits" 
                :key="index"
                type="password" 
                class="pin-box" 
                maxlength="1" 
                v-model="newPinDigits[index]" 
                @input="focusNextNewPin(index, $event)" 
                @keydown="handleNewPinKeydown(index, $event)"
                ref="newPinInputs"
                pattern="[0-9]"
                inputmode="numeric"
              >
            </div>
            <div class="form-text text-center">Enter your new 4-digit PIN</div>
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || !isFormValid">
              <span v-if="loading" class="loading-spinner me-2"></span>
              {{ loading ? 'Changing PIN...' : 'Change PIN' }}
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
  name: 'ChangePin',
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
        new_pin: ''
      },
      newPinDigits: ['', '', '', '']
    }
  },
  computed: {
    isFormValid() {
      return this.formData.card_id.length === 16 && this.formData.new_pin.length === 4
    }
  },
  watch: {
    newPinDigits: {
      handler(newDigits) {
        this.formData.new_pin = newDigits.join('')
      },
      deep: true
    }
  },
  methods: {
    navigate(page) {
      this.$emit('navigate', page)
    },
    focusNextNewPin(index, event) {
      const value = event.target.value
      if (value && /[0-9]/.test(value) && index < 3) {
        this.$refs.newPinInputs[index + 1].focus()
      }
    },
    handleNewPinKeydown(index, event) {
      if (event.key === 'Backspace' && !event.target.value && index > 0) {
        this.$refs.newPinInputs[index - 1].focus()
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
          type: 'pinChange',
          data: this.formData
        })
      }
    }
  }
}
</script>