package com.tucker.merchant.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Auth
@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Int,
    val user: User
)

@Serializable
data class User(
    val id: String,
    val phone: String,
    val name: String? = null,
    val avatar: String? = null,
    val role: String? = null
)

// Dashboard
@Serializable
data class DashboardStats(
    val todayOrders: Int,
    val todayRevenue: Double,
    val pendingOrders: Int,
    val totalOrders: Int,
    val totalRevenue: Double,
    val averageRating: Double,
    val ratingCount: Int
)

// Merchant
@Serializable
data class Merchant(
    val id: String,
    val name: String,
    val logo: String? = null,
    val banner: String? = null,
    val description: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val rating: Double? = null,
    val ratingCount: Int? = null,
    val monthlySales: Int? = null,
    val minOrderAmount: Double? = null,
    val deliveryFee: Double? = null,
    val deliveryTime: String? = null,
    val isOpen: Boolean
)

// Order
@Serializable
data class Order(
    val id: String,
    val orderNo: String,
    val userId: String? = null,
    val merchantId: String,
    val totalAmount: Double,
    val deliveryFee: Double,
    val discountAmount: Double,
    val payAmount: Double,
    val status: String,
    val deliveryAddress: DeliveryAddress? = null,
    val items: List<OrderItem>? = null,
    val remark: String? = null,
    val createdAt: String,
    val paidAt: String? = null,
    val completedAt: String? = null,
    val cancelledAt: String? = null,
    val cancelReason: String? = null
)

@Serializable
data class DeliveryAddress(
    val name: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val detail: String
) {
    val fullAddress: String
        get() = "$province$city$district$detail"
}

@Serializable
data class OrderItem(
    val id: String,
    val productId: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val image: String? = null,
    val options: List<String>? = null
)

// Product
@Serializable
data class Product(
    val id: String,
    val merchantId: String,
    val categoryId: String? = null,
    val name: String,
    val description: String? = null,
    val image: String? = null,
    val price: Double,
    val originalPrice: Double? = null,
    val monthlySales: Int? = null,
    val isAvailable: Boolean,
    val isRecommend: Boolean? = null
)

// Pagination
@Serializable
data class PaginatedResponse<T>(
    val items: List<T>,
    val pagination: Pagination
)

@Serializable
data class Pagination(
    val page: Int,
    val pageSize: Int,
    val total: Int,
    val totalPages: Int
)

// Requests
@Serializable
data class SendSmsRequest(val phone: String)

@Serializable
data class LoginRequest(val phone: String, val code: String)

@Serializable
data class UpdateOrderStatusRequest(val status: String, val reason: String? = null)

@Serializable
data class ToggleStoreRequest(val isOpen: Boolean)

@Serializable
data class CreateProductRequest(
    val name: String,
    val description: String? = null,
    val price: Double,
    val originalPrice: Double? = null,
    val image: String? = null,
    val categoryId: String? = null,
    val isAvailable: Boolean = true
)

@Serializable
data class UpdateProductRequest(
    val name: String? = null,
    val description: String? = null,
    val price: Double? = null,
    val originalPrice: Double? = null,
    val image: String? = null,
    val categoryId: String? = null,
    val isAvailable: Boolean? = null
)

@Serializable
data class UpdateStoreRequest(
    val name: String? = null,
    val description: String? = null,
    val logo: String? = null,
    val banner: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val deliveryFee: Double? = null,
    val deliveryTime: String? = null,
    val minOrderAmount: Double? = null
)

@Serializable
data class ToggleAvailabilityRequest(val isAvailable: Boolean)

@Serializable
data class SuccessResponse(val success: Boolean)
