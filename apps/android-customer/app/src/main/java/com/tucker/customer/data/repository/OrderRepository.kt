package com.tucker.customer.data.repository

import com.tucker.customer.data.api.ApiService
import com.tucker.customer.data.models.*
import kotlinx.serialization.Serializable
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getOrders(page: Int = 1, pageSize: Int = 20): PaginatedResponse<Order> {
        return apiService.getOrders(page, pageSize)
    }

    suspend fun getOrder(id: String): Order {
        return apiService.getOrder(id)
    }

    suspend fun getAddresses(): List<Address> {
        return apiService.getAddresses()
    }

    suspend fun createOrder(
        merchantId: String,
        addressId: String,
        items: List<OrderItemRequest>,
        remark: String?
    ): CreateOrderResponse {
        return apiService.createOrder(CreateOrderRequest(merchantId, addressId, items, remark))
    }

    suspend fun createPayment(orderId: String, method: String): PaymentResponse {
        return apiService.createPayment(CreatePaymentRequest(orderId, method))
    }

    suspend fun mockPayment(paymentId: String): MockPaymentResult {
        return apiService.mockPayment(paymentId)
    }

    @Serializable
    data class OrderItemRequest(
        val productId: String,
        val quantity: Int
    )

    @Serializable
    data class CreateOrderRequest(
        val merchantId: String,
        val addressId: String,
        val items: List<OrderItemRequest>,
        val remark: String? = null
    )

    @Serializable
    data class CreatePaymentRequest(
        val orderId: String,
        val method: String
    )
}
