package com.tucker.customer.ui.merchant

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.customer.data.models.Merchant
import com.tucker.customer.data.models.MenuResponse
import com.tucker.customer.data.models.Product
import com.tucker.customer.data.repository.CartRepository
import com.tucker.customer.data.repository.MerchantRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MerchantDetailViewModel @Inject constructor(
    private val merchantRepository: MerchantRepository,
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _merchant = MutableStateFlow<Merchant?>(null)
    val merchant: StateFlow<Merchant?> = _merchant.asStateFlow()

    private val _menu = MutableStateFlow<MenuResponse?>(null)
    val menu: StateFlow<MenuResponse?> = _menu.asStateFlow()

    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    val cartItems = cartRepository.items

    private val _totalItems = MutableStateFlow(0)
    val totalItems: StateFlow<Int> = _totalItems.asStateFlow()

    private val _totalPrice = MutableStateFlow(0.0)
    val totalPrice: StateFlow<Double> = _totalPrice.asStateFlow()

    init {
        viewModelScope.launch {
            cartRepository.items.collect { items ->
                _totalItems.value = items.sumOf { it.quantity }
                _totalPrice.value = items.sumOf { it.product.price * it.quantity }
            }
        }
    }

    fun loadMerchant(merchantId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val merchantResult = merchantRepository.getMerchant(merchantId)
                val menuResult = merchantRepository.getMerchantMenu(merchantId)
                _merchant.value = merchantResult
                _menu.value = menuResult
                _selectedCategory.value = menuResult.categories.firstOrNull()?.id
            } catch (e: Exception) {
                e.printStackTrace()
            }
            _isLoading.value = false
        }
    }

    fun selectCategory(categoryId: String) {
        _selectedCategory.value = categoryId
    }

    fun addToCart(product: Product) {
        cartRepository.addItem(product)
    }

    fun removeFromCart(product: Product) {
        cartRepository.removeItem(product)
    }

    fun getQuantity(productId: String): Int {
        return cartRepository.getQuantity(productId)
    }
}
