package com.tucker.customer.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.tucker.customer.data.api.ApiService
import com.tucker.customer.data.api.LoginRequest
import com.tucker.customer.data.api.SendCodeRequest
import com.tucker.customer.data.models.AuthResponse
import com.tucker.customer.data.models.User
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth")

@Singleton
class AuthRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val tokenKey = stringPreferencesKey("auth_token")

    private var apiService: ApiService? = null

    fun setApiService(api: ApiService) {
        apiService = api
    }

    val isAuthenticated: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[tokenKey] != null
    }

    fun getToken(): String? = runBlocking {
        context.dataStore.data.first()[tokenKey]
    }

    suspend fun sendCode(phone: String) {
        apiService?.sendSmsCode(SendCodeRequest(phone))
    }

    suspend fun login(phone: String, code: String): AuthResponse {
        val response = apiService?.login(LoginRequest(phone, code))
            ?: throw Exception("API not initialized")
        saveToken(response.accessToken)
        return response
    }

    suspend fun getUserProfile(): User {
        return apiService?.getUserProfile() ?: throw Exception("API not initialized")
    }

    suspend fun logout() {
        context.dataStore.edit { prefs ->
            prefs.remove(tokenKey)
        }
    }

    private suspend fun saveToken(token: String) {
        context.dataStore.edit { prefs ->
            prefs[tokenKey] = token
        }
    }
}
