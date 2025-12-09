package com.tucker.merchant.data.api

import com.tucker.merchant.data.model.*
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("auth/sms/send")
    suspend fun sendSmsCode(@Body request: SendSmsRequest)

    @POST("auth/login/phone")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    // Dashboard
    @GET("merchant/dashboard")
    suspend fun getDashboardStats(): DashboardStats

    // Orders
    @GET("merchant/orders")
    suspend fun getMerchantOrders(
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 20,
        @Query("status") status: String? = null
    ): PaginatedResponse<Order>

    @GET("merchant/orders/{id}")
    suspend fun getMerchantOrder(@Path("id") id: String): Order

    @PUT("merchant/orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") orderId: String,
        @Body request: UpdateOrderStatusRequest
    ): Order

    // Products
    @GET("merchant/products")
    suspend fun getMerchantProducts(): List<Product>

    @GET("merchant/products/{id}")
    suspend fun getMerchantProduct(@Path("id") id: String): Product

    @POST("merchant/products")
    suspend fun createProduct(@Body request: CreateProductRequest): Product

    @PUT("merchant/products/{id}")
    suspend fun updateProduct(
        @Path("id") id: String,
        @Body request: UpdateProductRequest
    ): Product

    @DELETE("merchant/products/{id}")
    suspend fun deleteProduct(@Path("id") id: String): SuccessResponse

    @PUT("merchant/products/{id}/availability")
    suspend fun toggleProductAvailability(
        @Path("id") id: String,
        @Body request: ToggleAvailabilityRequest
    ): Product

    // Store
    @GET("merchant/store")
    suspend fun getStoreSettings(): Merchant

    @PUT("merchant/store")
    suspend fun updateStoreSettings(@Body request: UpdateStoreRequest): Merchant

    @PUT("merchant/store/open")
    suspend fun toggleStoreOpen(@Body request: ToggleStoreRequest): Merchant
}
