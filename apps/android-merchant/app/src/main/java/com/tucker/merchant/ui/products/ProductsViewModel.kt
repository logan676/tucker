package com.tucker.merchant.ui.products

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.merchant.data.model.Product
import com.tucker.merchant.data.repository.MerchantRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProductsViewModel @Inject constructor(
    private val repository: MerchantRepository
) : ViewModel() {

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        loadProducts()
    }

    fun loadProducts() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _products.value = repository.getProducts()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load products"
            }
            _isLoading.value = false
        }
    }

    fun toggleAvailability(product: Product) {
        viewModelScope.launch {
            try {
                val updated = repository.toggleProductAvailability(product.id, !product.isAvailable)
                _products.value = _products.value.map {
                    if (it.id == product.id) updated else it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to update product"
            }
        }
    }

    fun deleteProduct(productId: String) {
        viewModelScope.launch {
            try {
                repository.deleteProduct(productId)
                _products.value = _products.value.filter { it.id != productId }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to delete product"
            }
        }
    }
}
