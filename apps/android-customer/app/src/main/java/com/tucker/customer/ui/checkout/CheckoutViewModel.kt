package com.tucker.customer.ui.checkout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.customer.data.models.Address
import com.tucker.customer.data.repository.AuthRepository
import com.tucker.customer.data.repository.CartItem
import com.tucker.customer.data.repository.CartRepository
import com.tucker.customer.data.repository.OrderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CheckoutViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val cartRepository: CartRepository,
    private val orderRepository: OrderRepository
) : ViewModel() {

    val isAuthenticated: StateFlow<Boolean> = authRepository.isAuthenticated
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    val cartItems: StateFlow<List<CartItem>> = cartRepository.items

    private val _addresses = MutableStateFlow<List<Address>>(emptyList())
    val addresses: StateFlow<List<Address>> = _addresses.asStateFlow()

    private val _selectedAddressId = MutableStateFlow<String?>(null)
    val selectedAddressId: StateFlow<String?> = _selectedAddressId.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _createdOrderId = MutableStateFlow<String?>(null)
    val createdOrderId: StateFlow<String?> = _createdOrderId.asStateFlow()

    val totalPrice: Double
        get() = cartRepository.totalPrice

    fun loadAddresses() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val addressList = orderRepository.getAddresses()
                _addresses.value = addressList
                _selectedAddressId.value = addressList.find { it.isDefault }?.id ?: addressList.firstOrNull()?.id
            } catch (e: Exception) {
                _error.value = "Failed to load addresses"
            }
            _isLoading.value = false
        }
    }

    fun selectAddress(addressId: String) {
        _selectedAddressId.value = addressId
    }

    fun submitOrder(remark: String?) {
        val addressId = _selectedAddressId.value ?: return
        val merchantId = cartRepository.merchantId.value ?: return
        val items = cartRepository.items.value

        if (items.isEmpty()) {
            _error.value = "Cart is empty"
            return
        }

        viewModelScope.launch {
            _isSubmitting.value = true
            _error.value = null
            try {
                val orderResponse = orderRepository.createOrder(
                    merchantId = merchantId,
                    addressId = addressId,
                    items = items.map { OrderRepository.OrderItemRequest(it.product.id, it.quantity) },
                    remark = remark?.takeIf { it.isNotBlank() }
                )
                cartRepository.clearCart()
                _createdOrderId.value = orderResponse.orderId
            } catch (e: Exception) {
                _error.value = "Failed to create order: ${e.message}"
            }
            _isSubmitting.value = false
        }
    }
}
