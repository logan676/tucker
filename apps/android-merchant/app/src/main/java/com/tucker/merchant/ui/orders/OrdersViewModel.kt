package com.tucker.merchant.ui.orders

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
class OrdersViewModel @Inject constructor(
    private val repository: MerchantRepository
) : ViewModel() {

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private val _selectedFilter = MutableStateFlow<String?>(null)
    val selectedFilter: StateFlow<String?> = _selectedFilter.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _currentPage = MutableStateFlow(1)
    private val _hasMore = MutableStateFlow(true)

    init {
        loadOrders()
    }

    fun setFilter(status: String?) {
        _selectedFilter.value = status
        _currentPage.value = 1
        _hasMore.value = true
        loadOrders()
    }

    fun loadOrders() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = repository.getOrders(
                    page = 1,
                    pageSize = 20,
                    status = _selectedFilter.value
                )
                _orders.value = response.items
                _currentPage.value = 1
                _hasMore.value = response.pagination.page < response.pagination.totalPages
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load orders"
            }
            _isLoading.value = false
        }
    }

    fun loadMore() {
        if (_isLoading.value || !_hasMore.value) return

        viewModelScope.launch {
            _isLoading.value = true
            try {
                val nextPage = _currentPage.value + 1
                val response = repository.getOrders(
                    page = nextPage,
                    pageSize = 20,
                    status = _selectedFilter.value
                )
                _orders.value = _orders.value + response.items
                _currentPage.value = nextPage
                _hasMore.value = response.pagination.page < response.pagination.totalPages
            } catch (e: Exception) {
                _error.value = e.message
            }
            _isLoading.value = false
        }
    }
}
