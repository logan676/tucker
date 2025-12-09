package com.tucker.merchant.ui.products

import androidx.lifecycle.SavedStateHandle
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
class ProductFormViewModel @Inject constructor(
    private val repository: MerchantRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val productId: String? = savedStateHandle.get<String>("productId")
    val isEditMode: Boolean = productId != null

    private val _name = MutableStateFlow("")
    val name: StateFlow<String> = _name.asStateFlow()

    private val _description = MutableStateFlow("")
    val description: StateFlow<String> = _description.asStateFlow()

    private val _price = MutableStateFlow("")
    val price: StateFlow<String> = _price.asStateFlow()

    private val _originalPrice = MutableStateFlow("")
    val originalPrice: StateFlow<String> = _originalPrice.asStateFlow()

    private val _image = MutableStateFlow("")
    val image: StateFlow<String> = _image.asStateFlow()

    private val _isAvailable = MutableStateFlow(true)
    val isAvailable: StateFlow<Boolean> = _isAvailable.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isSaving = MutableStateFlow(false)
    val isSaving: StateFlow<Boolean> = _isSaving.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _saveSuccess = MutableStateFlow(false)
    val saveSuccess: StateFlow<Boolean> = _saveSuccess.asStateFlow()

    init {
        if (productId != null) {
            loadProduct(productId)
        }
    }

    private fun loadProduct(id: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val product = repository.getProduct(id)
                _name.value = product.name
                _description.value = product.description ?: ""
                _price.value = product.price.toString()
                _originalPrice.value = product.originalPrice?.toString() ?: ""
                _image.value = product.image ?: ""
                _isAvailable.value = product.isAvailable
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load product"
            }
            _isLoading.value = false
        }
    }

    fun updateName(value: String) {
        _name.value = value
    }

    fun updateDescription(value: String) {
        _description.value = value
    }

    fun updatePrice(value: String) {
        // Only allow valid decimal input
        if (value.isEmpty() || value.matches(Regex("^\\d*\\.?\\d*$"))) {
            _price.value = value
        }
    }

    fun updateOriginalPrice(value: String) {
        if (value.isEmpty() || value.matches(Regex("^\\d*\\.?\\d*$"))) {
            _originalPrice.value = value
        }
    }

    fun updateImage(value: String) {
        _image.value = value
    }

    fun updateIsAvailable(value: Boolean) {
        _isAvailable.value = value
    }

    fun save() {
        val nameVal = _name.value.trim()
        val priceVal = _price.value.toDoubleOrNull()

        if (nameVal.isBlank()) {
            _error.value = "Product name is required"
            return
        }
        if (priceVal == null || priceVal <= 0) {
            _error.value = "Valid price is required"
            return
        }

        viewModelScope.launch {
            _isSaving.value = true
            _error.value = null
            try {
                if (isEditMode && productId != null) {
                    repository.updateProduct(
                        id = productId,
                        name = nameVal,
                        description = _description.value.ifBlank { null },
                        price = priceVal,
                        originalPrice = _originalPrice.value.toDoubleOrNull(),
                        image = _image.value.ifBlank { null },
                        categoryId = null,
                        isAvailable = _isAvailable.value
                    )
                } else {
                    repository.createProduct(
                        name = nameVal,
                        description = _description.value.ifBlank { null },
                        price = priceVal,
                        originalPrice = _originalPrice.value.toDoubleOrNull(),
                        image = _image.value.ifBlank { null },
                        categoryId = null,
                        isAvailable = _isAvailable.value
                    )
                }
                _saveSuccess.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to save product"
            }
            _isSaving.value = false
        }
    }
}
