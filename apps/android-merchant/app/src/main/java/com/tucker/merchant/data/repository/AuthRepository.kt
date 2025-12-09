package com.tucker.merchant.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.tucker.merchant.data.api.ApiService
import com.tucker.merchant.data.model.AuthResponse
import com.tucker.merchant.data.model.LoginRequest
import com.tucker.merchant.data.model.SendSmsRequest
import com.tucker.merchant.data.model.User
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

@Singleton
class AuthRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val json: Json
) {
    private val tokenKey = stringPreferencesKey("auth_token")
    private val userKey = stringPreferencesKey("auth_user")

    val isAuthenticated: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[tokenKey] != null
    }

    val currentUser: Flow<User?> = context.dataStore.data.map { prefs ->
        prefs[userKey]?.let { userJson ->
            try {
                json.decodeFromString<User>(userJson)
            } catch (e: Exception) {
                null
            }
        }
    }

    fun getToken(): String? = runBlocking {
        context.dataStore.data.first()[tokenKey]
    }

    suspend fun saveAuth(response: AuthResponse) {
        context.dataStore.edit { prefs ->
            prefs[tokenKey] = response.accessToken
            prefs[userKey] = json.encodeToString(response.user)
        }
    }

    suspend fun clearAuth() {
        context.dataStore.edit { prefs ->
            prefs.remove(tokenKey)
            prefs.remove(userKey)
        }
    }
}

@Singleton
class MerchantAuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val authRepository: AuthRepository
) {
    suspend fun sendSmsCode(phone: String) {
        apiService.sendSmsCode(SendSmsRequest(phone))
    }

    suspend fun login(phone: String, code: String): AuthResponse {
        val response = apiService.login(LoginRequest(phone, code))

        // Check if user has merchant role
        if (response.user.role != "merchant" && response.user.role != "admin") {
            throw IllegalAccessException("Access denied. This app is for merchants only.")
        }

        authRepository.saveAuth(response)
        return response
    }

    suspend fun logout() {
        authRepository.clearAuth()
    }
}
