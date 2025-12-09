package com.tucker.customer.ui.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.tucker.customer.data.models.Address
import com.tucker.customer.data.repository.CartItem
import com.tucker.customer.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onBackClick: () -> Unit,
    onLoginClick: () -> Unit,
    onPaymentNavigate: (String) -> Unit,
    viewModel: CheckoutViewModel = hiltViewModel()
) {
    val isAuthenticated by viewModel.isAuthenticated.collectAsState()
    val addresses by viewModel.addresses.collectAsState()
    val selectedAddressId by viewModel.selectedAddressId.collectAsState()
    val cartItems by viewModel.cartItems.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isSubmitting by viewModel.isSubmitting.collectAsState()
    val error by viewModel.error.collectAsState()
    val createdOrderId by viewModel.createdOrderId.collectAsState()
    var remark by remember { mutableStateOf("") }

    LaunchedEffect(isAuthenticated) {
        if (isAuthenticated) {
            viewModel.loadAddresses()
        }
    }

    LaunchedEffect(createdOrderId) {
        createdOrderId?.let { orderId ->
            onPaymentNavigate(orderId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Checkout") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Orange,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        },
        bottomBar = {
            if (isAuthenticated && cartItems.isNotEmpty()) {
                CheckoutBottomBar(
                    totalPrice = viewModel.totalPrice + 5.0, // delivery fee
                    isSubmitting = isSubmitting,
                    enabled = selectedAddressId != null,
                    onCheckout = { viewModel.submitOrder(remark) }
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                !isAuthenticated -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = Gray
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Please login to checkout", color = Gray)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = onLoginClick,
                            colors = ButtonDefaults.buttonColors(containerColor = Orange),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Text("Login")
                        }
                    }
                }
                isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Orange)
                    }
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(LightGray),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Error
                        error?.let { errorMessage ->
                            item {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Red.copy(alpha = 0.1f))
                                ) {
                                    Text(
                                        text = errorMessage,
                                        color = Red,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }
                        }

                        // Address Section
                        item {
                            AddressSection(
                                addresses = addresses,
                                selectedAddressId = selectedAddressId,
                                onAddressSelect = { viewModel.selectAddress(it) },
                                onAddAddress = { /* Navigate to add address */ }
                            )
                        }

                        // Order Items Section
                        item {
                            OrderItemsSection(cartItems = cartItems)
                        }

                        // Remark Section
                        item {
                            RemarkSection(
                                remark = remark,
                                onRemarkChange = { remark = it }
                            )
                        }

                        // Price Summary
                        item {
                            PriceSummarySection(
                                subtotal = viewModel.totalPrice,
                                deliveryFee = 5.0
                            )
                        }

                        // Bottom spacing
                        item {
                            Spacer(modifier = Modifier.height(80.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AddressSection(
    addresses: List<Address>,
    selectedAddressId: String?,
    onAddressSelect: (String) -> Unit,
    onAddAddress: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = Orange,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Delivery Address", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (addresses.isEmpty()) {
                OutlinedButton(
                    onClick = onAddAddress,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Add delivery address")
                }
            } else {
                addresses.forEach { address ->
                    AddressItem(
                        address = address,
                        isSelected = selectedAddressId == address.id,
                        onClick = { onAddressSelect(address.id) }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun AddressItem(
    address: Address,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(8.dp),
        color = if (isSelected) Orange.copy(alpha = 0.1f) else LightGray,
        border = if (isSelected) ButtonDefaults.outlinedButtonBorder else null
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            Icon(
                imageVector = if (isSelected) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                contentDescription = null,
                tint = if (isSelected) Orange else Gray,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row {
                    Text(address.name, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(address.phone, color = Gray)
                    address.label?.let { label ->
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            color = LightGray,
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = label,
                                style = MaterialTheme.typography.labelSmall,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${address.province} ${address.city} ${address.district} ${address.detail}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray
                )
            }
        }
    }
}

@Composable
fun OrderItemsSection(cartItems: List<CartItem>) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.ShoppingBag,
                    contentDescription = null,
                    tint = Orange,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Order Items", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            cartItems.forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = item.product.image,
                        contentDescription = item.product.name,
                        modifier = Modifier
                            .size(50.dp)
                            .clip(RoundedCornerShape(8.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(item.product.name, style = MaterialTheme.typography.bodyMedium)
                        Text(
                            text = "¥${item.product.price.toInt()}",
                            color = Orange,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    Text("x${item.quantity}", color = Gray)
                }
            }
        }
    }
}

@Composable
fun RemarkSection(
    remark: String,
    onRemarkChange: (String) -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Order Notes", fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = remark,
                onValueChange = onRemarkChange,
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Add any special instructions...") },
                maxLines = 3,
                shape = RoundedCornerShape(8.dp)
            )
        }
    }
}

@Composable
fun PriceSummarySection(
    subtotal: Double,
    deliveryFee: Double
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Subtotal", color = Gray)
                Text("¥${String.format("%.2f", subtotal)}")
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Delivery Fee", color = Gray)
                Text("¥${String.format("%.2f", deliveryFee)}")
            }
            Divider(modifier = Modifier.padding(vertical = 12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Total", fontWeight = FontWeight.Bold)
                Text(
                    text = "¥${String.format("%.2f", subtotal + deliveryFee)}",
                    fontWeight = FontWeight.Bold,
                    color = Orange
                )
            }
        }
    }
}

@Composable
fun CheckoutBottomBar(
    totalPrice: Double,
    isSubmitting: Boolean,
    enabled: Boolean,
    onCheckout: () -> Unit
) {
    Surface(
        color = Color.White,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Total", style = MaterialTheme.typography.bodySmall, color = Gray)
                Text(
                    text = "¥${String.format("%.2f", totalPrice)}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Orange
                )
            }
            Button(
                onClick = onCheckout,
                enabled = enabled && !isSubmitting,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Orange,
                    disabledContainerColor = Gray
                ),
                shape = RoundedCornerShape(25.dp),
                modifier = Modifier.height(50.dp)
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                } else {
                    Text("Place Order", modifier = Modifier.padding(horizontal = 16.dp))
                }
            }
        }
    }
}
