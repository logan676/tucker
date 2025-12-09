package com.tucker.customer.data.repository

import com.tucker.customer.data.models.Product
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

data class CartItem(
    val product: Product,
    var quantity: Int
)

@Singleton
class CartRepository @Inject constructor() {
    private val _items = MutableStateFlow<List<CartItem>>(emptyList())
    val items: StateFlow<List<CartItem>> = _items.asStateFlow()

    private val _merchantId = MutableStateFlow<String?>(null)
    val merchantId: StateFlow<String?> = _merchantId.asStateFlow()

    val totalItems: Int
        get() = _items.value.sumOf { it.quantity }

    val totalPrice: Double
        get() = _items.value.sumOf { it.product.price * it.quantity }

    fun addItem(product: Product) {
        val currentMerchantId = _merchantId.value
        if (currentMerchantId != null && currentMerchantId != product.merchantId) {
            clearCart()
        }
        _merchantId.value = product.merchantId

        val currentItems = _items.value.toMutableList()
        val existingIndex = currentItems.indexOfFirst { it.product.id == product.id }
        if (existingIndex >= 0) {
            currentItems[existingIndex] = currentItems[existingIndex].copy(
                quantity = currentItems[existingIndex].quantity + 1
            )
        } else {
            currentItems.add(CartItem(product, 1))
        }
        _items.value = currentItems
    }

    fun removeItem(product: Product) {
        val currentItems = _items.value.toMutableList()
        val existingIndex = currentItems.indexOfFirst { it.product.id == product.id }
        if (existingIndex >= 0) {
            val item = currentItems[existingIndex]
            if (item.quantity > 1) {
                currentItems[existingIndex] = item.copy(quantity = item.quantity - 1)
            } else {
                currentItems.removeAt(existingIndex)
            }
        }
        _items.value = currentItems

        if (_items.value.isEmpty()) {
            _merchantId.value = null
        }
    }

    fun getQuantity(productId: String): Int {
        return _items.value.find { it.product.id == productId }?.quantity ?: 0
    }

    fun clearCart() {
        _items.value = emptyList()
        _merchantId.value = null
    }
}
