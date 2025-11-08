
 export async function handleFormSubmit({ type, data }) {
      this.loading = true
      this.message = ''
      
      try {
        let url, body
        
        switch (type) {
          case 'activation':
            url = 'https://api.espees.org/cards/activate'
            body = {
              card_id: data.card_id,
              crdpn: data.crdpn
            }
            break
          case 'pinChange':
            url = 'https://api.espees.org/cards/add'
            body = {
              card_id: data.card_id
              // Note: The API might need adjustment for PIN change
            }
            break
          case 'transactions':
            url = 'https://api.espees.org/cards/balance'
            body = {
              card_id: data.card_id
            }
            break
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            // 'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        this.message = this.getSuccessMessage(type)
        this.messageType = 'success'
        
        // Navigate back to home after successful operation
        if (type !== 'transactions') {
          setTimeout(() => {
            this.currentPage = 'home'
          }, 2000)
        }
        
        console.log('API Response:', result)
        
      } catch (error) {
        console.error('Error:', error)
        this.message = this.getErrorMessage(type)
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    }
    function getSuccessMessage(type) {
      const messages = {
        activation: 'Card activated successfully!',
        pinChange: 'PIN changed successfully!',
        transactions: 'Transactions retrieved successfully!'
      }
      return messages[type]
    }

   function getErrorMessage(type) {
      const messages = {
        activation: 'Error activating card. Please try again.',
        pinChange: 'Error changing PIN. Please try again.',
        transactions: 'Error retrieving transactions. Please try again.'
      }
      return messages[type]
    }