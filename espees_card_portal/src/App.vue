<template>
  <div class="portal-container">
   <div class="nebula"></div>
    <div class="stars" id="stars"></div>
    <div class="floating-elements" id="floatingElements"></div>
    <div class="glass-card">
      <!-- Header -->
      <div class="portal-header">
        <h1 class="display-5 fw-bold">Card Portal</h1>
        <p class="lead">Manage your card securely and conveniently</p>
      </div>
      
      <!-- Dynamic Component Rendering -->
      <component 
        :is="currentComponent" 
        @navigate="handleNavigation"
        :loading="loading"
        @submit-form="handleFormSubmit"
        :message="message"
        :message-type="messageType"
        :transaction-data="transactionData"
      />
    </div>
  </div>
</template>

<script>
import HomePage from './components/HomePage.vue'
import ActivateCard from './components/ActivateCard.vue'
import ChangePin from './components/ChangePin.vue'
import Transactions from './components/Transactions.vue'

const API_BASE_URL = 'http://localhost:3002/proxy' //'http://102.219.189.173/proxy'  

export default {
  name: 'App',
  components: {
    HomePage,
    ActivateCard,
    ChangePin,
    Transactions
  },
  data() {
    return {
      currentPage: 'home',
      loading: false,
      message: '',
      messageType: '',
      cardDetails:{}
    }
  },
  computed: {
    currentComponent() {
      const components = {
        home: 'HomePage',
        activate: 'ActivateCard',
        changePin: 'ChangePin',
        transactions: 'Transactions'
      }
      return components[this.currentPage]
    }
  },
  methods:{  
    handleNavigation(page) {
      this.currentPage = page
      this.message = ''
      // Clear transaction data when navigating away from transactions page
      if (page !== 'transactions') {
        this.transactionData = null
      }
    },
    async handleFormSubmit({ type, data }) {
      this.loading = true
      this.message = ''
      
      try {
        let endpoint, body
        
        switch (type) {
          case 'activation':
            endpoint = '/cards/activate'
            body = {
              card_id: data.card_id,
              crdpn: data.crdpn
            }
            break
            case 'add-card':
            endpoint = '/cards/add'
            body = {
              card_id: data.card_id
            }
            break
          case 'pinChange':
           
            return;
            break
          case 'transactions':
            endpoint = '/cards/balance'
            body = {
              card_id: data.card_id
            }
            break
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        this.message =  result.message  //this.getSuccessMessage(type)
        this.messageType = 'success'
        
        // Store the API response data for the transactions page
        if (type === 'transactions') {
          this.transactionData = result
          // console.log('Transaction data stored:', this.transactionData)
        }
        
        // Navigate back to home after successful operation (except transactions)
        if (type !== 'transactions') {
          setTimeout(() => {
            this.currentPage = 'home'
          }, 4000)
        }
        
        console.log('API Response:', result)
        
      } catch (error) {
        console.error('Error:', error)
        this.message = this.getErrorMessage(type)
        this.messageType = 'error'
        
        // Clear transaction data on error
        if (type === 'transactions') {
          this.transactionData = null
        }
      } finally {
        this.loading = false
      }
    },
    getSuccessMessage(type) {
      const messages = {
        activation: 'Card activated successfully!',
        pinChange: 'PIN changed successfully!',
        transactions: 'Transactions retrieved successfully!'
      }
      return messages[type]
    },
    getErrorMessage(type) {
      const messages = {
        activation: 'Error activating card. Please try again.',
        pinChange: 'Error changing PIN. Please try again.',
        transactions: 'Error retrieving transactions. Please try again.'
      }
      return messages[type]
    }
  }
}

 // Create floating elements
        function createFloatingElements() {
            const container = document.getElementById('floatingElements');
            const elementCount = 20;
            
            for (let i = 0; i < elementCount; i++) {
                const element = document.createElement('div');
                element.classList.add('floating-element');
                
                // Random properties
                const size = Math.random() * 100 + 20;
                const left = Math.random() * 100;
                const delay = Math.random() * 15;
                const duration = Math.random() * 10 + 15;
                
                element.style.width = `${size}px`;
                element.style.height = `${size}px`;
                element.style.left = `${left}%`;
                element.style.animationDelay = `${delay}s`;
                element.style.animationDuration = `${duration}s`;
                
                container.appendChild(element);
            }
        }
        
        // Create stars
        function createStars() {
            const container = document.getElementById('stars');
            const starCount = 100;
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.classList.add('star');
                
                // Random properties
                const size = Math.random() * 3;
                const left = Math.random() * 100;
                const top = Math.random() * 100;
                const delay = Math.random() * 5;
                const duration = Math.random() * 3 + 2;
                
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.left = `${left}%`;
                star.style.top = `${top}%`;
                star.style.animationDelay = `${delay}s`;
                star.style.animationDuration = `${duration}s`;
                
                container.appendChild(star);
            }
        }
        
        // Initialize when page loads
        window.addEventListener('load', function() {
            createFloatingElements();
            createStars();
        });
</script>