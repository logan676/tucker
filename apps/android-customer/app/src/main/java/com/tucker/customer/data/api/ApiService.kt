package com.tucker.customer.data.api

import com.tucker.customer.data.models.*
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("auth/sms/send")
    suspend fun sendSmsCode(@Body request: SendCodeRequest)

    @POST("auth/login/phone")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    // Merchants
    @GET("merchants/categories")
    suspend fun getCategories(): List<Category>

    @GET("merchants")
    suspend fun getMerchants(
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 20
    ): PaginatedResponse<Merchant>

    @GET("merchants/{id}")
    suspend fun getMerchant(@Path("id") id: String): Merchant

    @GET("merchants/{id}/products")
    suspend fun getMerchantMenu(@Path("id") id: String): MenuResponse

    // Orders
    @GET("orders")
    suspend fun getOrders(
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 20
    ): PaginatedResponse<Order>

    @GET("orders/{id}")
    suspend fun getOrder(@Path("id") id: String): Order

    // User
    @GET("users/me")
    suspend fun getUserProfile(): User
}

@kotlinx.serialization.Serializable
data class SendCodeRequest(val phone: String)

@kotlinx.serialization.Serializable
data class LoginRequest(val phone: String, val code: String)
