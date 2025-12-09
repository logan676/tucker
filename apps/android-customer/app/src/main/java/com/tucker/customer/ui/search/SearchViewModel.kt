package com.tucker.customer.ui.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.customer.data.models.Merchant
import com.tucker.customer.data.repository.MerchantRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val merchantRepository: MerchantRepository
) : ViewModel() {

    private val _searchText = MutableStateFlow("")
    val searchText: StateFlow<String> = _searchText.asStateFlow()

    private val _merchants = MutableStateFlow<List<Merchant>>(emptyList())
    val merchants: StateFlow<List<Merchant>> = _merchants.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _hasSearched = MutableStateFlow(false)
    val hasSearched: StateFlow<Boolean> = _hasSearched.asStateFlow()

    private var searchJob: Job? = null

    fun updateSearchText(text: String) {
        _searchText.value = text
        searchJob?.cancel()
        if (text.isNotEmpty()) {
            searchJob = viewModelScope.launch {
                delay(300) // Debounce
                search()
            }
        } else {
            _merchants.value = emptyList()
            _hasSearched.value = false
        }
    }

    fun clearSearch() {
        _searchText.value = ""
        _merchants.value = emptyList()
        _hasSearched.value = false
    }

    private suspend fun search() {
        _isLoading.value = true
        _hasSearched.value = true
        try {
            val response = merchantRepository.getMerchants()
            // Filter locally - in real app this would be server-side
            _merchants.value = response.items.filter { merchant ->
                merchant.name.contains(_searchText.value, ignoreCase = true)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _merchants.value = emptyList()
        }
        _isLoading.value = false
    }
}
