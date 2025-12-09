package com.tucker.customer.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tucker.customer.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _phone = MutableStateFlow("")
    val phone: StateFlow<String> = _phone.asStateFlow()

    private val _code = MutableStateFlow("")
    val code: StateFlow<String> = _code.asStateFlow()

    private val _codeSent = MutableStateFlow(false)
    val codeSent: StateFlow<Boolean> = _codeSent.asStateFlow()

    private val _countdown = MutableStateFlow(0)
    val countdown: StateFlow<Int> = _countdown.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _loginSuccess = MutableStateFlow(false)
    val loginSuccess: StateFlow<Boolean> = _loginSuccess.asStateFlow()

    fun updatePhone(value: String) {
        _phone.value = value.filter { it.isDigit() }.take(11)
    }

    fun updateCode(value: String) {
        _code.value = value.filter { it.isDigit() }.take(6)
    }

    fun sendCode() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                authRepository.sendCode(_phone.value)
                _codeSent.value = true
                startCountdown()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to send code"
            }
            _isLoading.value = false
        }
    }

    private fun startCountdown() {
        viewModelScope.launch {
            _countdown.value = 60
            while (_countdown.value > 0) {
                delay(1000)
                _countdown.value--
            }
        }
    }

    fun login() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                authRepository.login(_phone.value, _code.value)
                _loginSuccess.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Login failed"
            }
            _isLoading.value = false
        }
    }
}
