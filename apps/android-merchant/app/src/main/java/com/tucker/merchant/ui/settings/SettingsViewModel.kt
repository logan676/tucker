package com.tucker.merchant.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.merchant.data.model.Merchant
import com.tucker.merchant.data.repository.MerchantAuthRepository
import com.tucker.merchant.data.repository.MerchantRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val repository: MerchantRepository,
    private val authRepository: MerchantAuthRepository
) : ViewModel() {

    private val _store = MutableStateFlow<Merchant?>(null)
    val store: StateFlow<Merchant?> = _store.asStateFlow()

    private val _name = MutableStateFlow("")
    val name: StateFlow<String> = _name.asStateFlow()

    private val _description = MutableStateFlow("")
    val description: StateFlow<String> = _description.asStateFlow()

    private val _phone = MutableStateFlow("")
    val phone: StateFlow<String> = _phone.asStateFlow()

    private val _address = MutableStateFlow("")
    val address: StateFlow<String> = _address.asStateFlow()

    private val _deliveryFee = MutableStateFlow("")
    val deliveryFee: StateFlow<String> = _deliveryFee.asStateFlow()

    private val _deliveryTime = MutableStateFlow("")
    val deliveryTime: StateFlow<String> = _deliveryTime.asStateFlow()

    private val _minOrderAmount = MutableStateFlow("")
    val minOrderAmount: StateFlow<String> = _minOrderAmount.asStateFlow()

    private val _isOpen = MutableStateFlow(false)
    val isOpen: StateFlow<Boolean> = _isOpen.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isSaving = MutableStateFlow(false)
    val isSaving: StateFlow<Boolean> = _isSaving.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _saveSuccess = MutableStateFlow(false)
    val saveSuccess: StateFlow<Boolean> = _saveSuccess.asStateFlow()

    init {
        loadStore()
    }

    fun loadStore() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val merchant = repository.getStoreSettings()
                _store.value = merchant
                _name.value = merchant.name
                _description.value = merchant.description ?: ""
                _phone.value = merchant.phone ?: ""
                _address.value = merchant.address ?: ""
                _deliveryFee.value = merchant.deliveryFee?.toString() ?: ""
                _deliveryTime.value = merchant.deliveryTime ?: ""
                _minOrderAmount.value = merchant.minOrderAmount?.toString() ?: ""
                _isOpen.value = merchant.isOpen
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load store settings"
            }
            _isLoading.value = false
        }
    }

    fun updateName(value: String) { _name.value = value }
    fun updateDescription(value: String) { _description.value = value }
    fun updatePhone(value: String) { _phone.value = value }
    fun updateAddress(value: String) { _address.value = value }
    fun updateDeliveryFee(value: String) {
        if (value.isEmpty() || value.matches(Regex("^\\d*\\.?\\d*$"))) {
            _deliveryFee.value = value
        }
    }
    fun updateDeliveryTime(value: String) { _deliveryTime.value = value }
    fun updateMinOrderAmount(value: String) {
        if (value.isEmpty() || value.matches(Regex("^\\d*\\.?\\d*$"))) {
            _minOrderAmount.value = value
        }
    }

    fun toggleStoreOpen() {
        viewModelScope.launch {
            try {
                val updated = repository.toggleStoreOpen(!_isOpen.value)
                _isOpen.value = updated.isOpen
                _store.value = updated
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to update store status"
            }
        }
    }

    fun saveSettings() {
        viewModelScope.launch {
            _isSaving.value = true
            _error.value = null
            try {
                val updated = repository.updateStoreSettings(
                    name = _name.value.ifBlank { null },
                    description = _description.value.ifBlank { null },
                    logo = null,
                    banner = null,
                    phone = _phone.value.ifBlank { null },
                    address = _address.value.ifBlank { null },
                    deliveryFee = _deliveryFee.value.toDoubleOrNull(),
                    deliveryTime = _deliveryTime.value.ifBlank { null },
                    minOrderAmount = _minOrderAmount.value.toDoubleOrNull()
                )
                _store.value = updated
                _saveSuccess.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to save settings"
            }
            _isSaving.value = false
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }

    fun clearSaveSuccess() {
        _saveSuccess.value = false
    }
}
