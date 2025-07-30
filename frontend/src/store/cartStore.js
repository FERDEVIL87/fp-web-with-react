// cartStore.js
import { reactive, computed } from 'vue';

export const cartStore = reactive({
  items: [],

  addItem(product) {

    const itemToAdd = { ...product };
    if (!itemToAdd.qty) { 
        itemToAdd.qty = 1;
    }
    this.items.push(itemToAdd);
    console.log("Cart after add:", JSON.parse(JSON.stringify(this.items))); // For deep logging
  },

  removeItem(compositeId) { 
    this.items = this.items.filter(item => `${item.source}-${item.id}` !== compositeId);
  },

  updateItemQuantity(compositeId, newQuantity) {
    const item = this.items.find(item => `${item.source}-${item.id}` === compositeId);
    if (item) {
      item.qty = Math.max(1, newQuantity); 
    }
  },

  clearCart() {
    this.items = [];
  },

  get totalPrice() {
    return this.items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        return sum + (price * qty);
    }, 0);
  }
});