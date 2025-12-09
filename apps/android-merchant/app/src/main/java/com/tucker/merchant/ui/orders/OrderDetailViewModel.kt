package com.tucker.merchant.ui.orders

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.merchant.data.model.Order
import com.tucker.merchant.data.repository.MerchantRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrderDetailViewModel @Inject constructor(
    private val repository: MerchantRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val orderId: String = savedStateHandle.get<String>("orderId") ?: ""

    private val _order = MutableStateFlow<Order?>(null)
    val order: StateFlow<Order?> = _order.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isUpdating = MutableStateFlow(false)
    val isUpdating: StateFlow<Boolean> = _isUpdating.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _updateSuccess = MutableStateFlow(false)
    val updateSuccess: StateFlow<Boolean> = _updateSuccess.asStateFlow()

    init {
        loadOrder()
    }

    fun loadOrder() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _order.value = repository.getOrder(orderId)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load order"
            }
            _isLoading.value = false
        }
    }

    fun updateStatus(status: String, reason: String? = null) {
        viewModelScope.launch {
            _isUpdating.value = true
            _error.value = null
            try {
                _order.value = repository.updateOrderStatus(orderId, status, reason)
                _updateSuccess.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to update order"
            }
            _isUpdating.value = false
        }
    }

    fun getNextStatus(): String? {
        return when (_order.value?.status) {
            "pending" -> "confirmed"
            "confirmed" -> "preparing"
            "preparing" -> "ready"
            "ready" -> "delivering"
            "delivering" -> "completed"
            else -> null
        }
    }

    fun getNextStatusLabel(): String? {
        return when (getNextStatus()) {
            "confirmed" -> "Confirm Order"
            "preparing" -> "Start Preparing"
            "ready" -> "Mark as Ready"
            "delivering" -> "Out for Delivery"
            "completed" -> "Complete Order"
            else -> null
        }
    }
}
