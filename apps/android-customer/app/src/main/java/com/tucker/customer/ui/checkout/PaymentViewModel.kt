package com.tucker.customer.ui.checkout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.customer.data.models.Order
import com.tucker.customer.data.repository.OrderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PaymentViewModel @Inject constructor(
    private val orderRepository: OrderRepository
) : ViewModel() {

    private val _order = MutableStateFlow<Order?>(null)
    val order: StateFlow<Order?> = _order.asStateFlow()

    private val _paymentId = MutableStateFlow<String?>(null)
    val paymentId: StateFlow<String?> = _paymentId.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isProcessing = MutableStateFlow(false)
    val isProcessing: StateFlow<Boolean> = _isProcessing.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _paymentSuccess = MutableStateFlow(false)
    val paymentSuccess: StateFlow<Boolean> = _paymentSuccess.asStateFlow()

    fun loadOrder(orderId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _order.value = orderRepository.getOrder(orderId)
            } catch (e: Exception) {
                _error.value = "Failed to load order"
            }
            _isLoading.value = false
        }
    }

    fun initiatePayment(orderId: String, method: String) {
        viewModelScope.launch {
            _isProcessing.value = true
            _error.value = null
            try {
                val response = orderRepository.createPayment(orderId, method)
                _paymentId.value = response.paymentId
            } catch (e: Exception) {
                _error.value = "Failed to initiate payment"
            }
            _isProcessing.value = false
        }
    }

    fun simulatePayment() {
        val paymentIdValue = _paymentId.value ?: return
        viewModelScope.launch {
            _isProcessing.value = true
            _error.value = null
            try {
                orderRepository.mockPayment(paymentIdValue)
                _paymentSuccess.value = true
            } catch (e: Exception) {
                _error.value = "Payment failed"
            }
            _isProcessing.value = false
        }
    }

    fun resetPayment() {
        _paymentId.value = null
    }
}
