package com.tucker.customer.ui.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.tucker.customer.ui.theme.*
import kotlinx.coroutines.delay

enum class PaymentMethod(val displayName: String, val color: Color) {
    WECHAT("WeChat Pay", Color(0xFF07C160)),
    ALIPAY("Alipay", Color(0xFF1677FF)),
    CARD("Credit/Debit Card", Color(0xFF9C27B0))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentScreen(
    orderId: String,
    onBackClick: () -> Unit,
    onSuccess: () -> Unit,
    viewModel: PaymentViewModel = hiltViewModel()
) {
    val order by viewModel.order.collectAsState()
    val paymentId by viewModel.paymentId.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isProcessing by viewModel.isProcessing.collectAsState()
    val error by viewModel.error.collectAsState()
    val paymentSuccess by viewModel.paymentSuccess.collectAsState()
    var selectedMethod by remember { mutableStateOf(PaymentMethod.WECHAT) }
    var countdown by remember { mutableIntStateOf(900) }

    LaunchedEffect(orderId) {
        viewModel.loadOrder(orderId)
    }

    LaunchedEffect(Unit) {
        while (countdown > 0) {
            delay(1000)
            countdown--
        }
    }

    LaunchedEffect(paymentSuccess) {
        if (paymentSuccess) {
            onSuccess()
        }
    }

    if (paymentSuccess) {
        OrderSuccessScreen(
            order = order,
            onBackHome = onBackClick
        )
    } else {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Payment") },
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
            }
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(LightGray)
            ) {
                when {
                    isLoading -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = Orange)
                        }
                    }
                    else -> {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            // Countdown
                            Text(
                                text = "Time remaining: ${formatTime(countdown)}",
                                color = Gray
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Amount Card
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(24.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text("Amount to Pay", color = Gray)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "¥${String.format("%.2f", order?.payAmount ?: 0.0)}",
                                        fontSize = 40.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Orange
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Order: ${order?.orderNo ?: ""}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Gray
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Error
                            error?.let { errorMessage ->
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Red.copy(alpha = 0.1f)),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = errorMessage,
                                        color = Red,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(16.dp))
                            }

                            if (paymentId == null) {
                                // Payment Method Selection
                                Card(
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.White),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text("Select Payment Method", fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.height(12.dp))

                                        PaymentMethod.entries.forEach { method ->
                                            PaymentMethodItem(
                                                method = method,
                                                isSelected = selectedMethod == method,
                                                onClick = { selectedMethod = method }
                                            )
                                            Spacer(modifier = Modifier.height(8.dp))
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.weight(1f))

                                // Pay Button
                                Button(
                                    onClick = { viewModel.initiatePayment(orderId, selectedMethod.name.lowercase()) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(56.dp),
                                    enabled = countdown > 0 && !isProcessing,
                                    colors = ButtonDefaults.buttonColors(containerColor = Orange),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    if (isProcessing) {
                                        CircularProgressIndicator(
                                            color = Color.White,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    } else {
                                        Text(
                                            text = "Pay ¥${String.format("%.2f", order?.payAmount ?: 0.0)}",
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            } else {
                                // Mock Payment QR
                                Card(
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.White),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(200.dp)
                                                .background(LightGray, RoundedCornerShape(12.dp)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                Text("Scan QR Code", color = Gray)
                                                Text("(Mock Payment)", style = MaterialTheme.typography.bodySmall, color = Gray)
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(16.dp))
                                        Text(
                                            text = "In production, this would show a ${selectedMethod.displayName} QR code",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Gray,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.weight(1f))

                                // Simulate Payment
                                Button(
                                    onClick = { viewModel.simulatePayment() },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(56.dp),
                                    enabled = !isProcessing,
                                    colors = ButtonDefaults.buttonColors(containerColor = Green),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    if (isProcessing) {
                                        CircularProgressIndicator(
                                            color = Color.White,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    } else {
                                        Text("Simulate Successful Payment", fontWeight = FontWeight.Bold)
                                    }
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                OutlinedButton(
                                    onClick = { viewModel.resetPayment() },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Change Payment Method")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PaymentMethodItem(
    method: PaymentMethod,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(8.dp),
        color = if (isSelected) method.color.copy(alpha = 0.1f) else LightGray,
        border = if (isSelected) ButtonDefaults.outlinedButtonBorder else null
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(method.color, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = method.displayName.first().toString(),
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(method.displayName, modifier = Modifier.weight(1f))
            Icon(
                imageVector = if (isSelected) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                contentDescription = null,
                tint = if (isSelected) method.color else Gray
            )
        }
    }
}

@Composable
fun OrderSuccessScreen(
    order: com.tucker.customer.data.models.Order?,
    onBackHome: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightGray)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Success Icon
        Box(
            modifier = Modifier
                .size(80.dp)
                .background(Green, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Check,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(40.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Order Placed Successfully!",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Green
        )

        Text(
            text = "Your order is being prepared",
            color = Gray
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Order Info
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Order Number", color = Gray)
                    Text(order?.orderNo ?: "", fontWeight = FontWeight.Medium)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Total Paid", color = Gray)
                    Text(
                        text = "¥${String.format("%.2f", order?.payAmount ?: 0.0)}",
                        fontWeight = FontWeight.Bold,
                        color = Orange
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Estimated Time
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Estimated Delivery Time", color = Gray)
                Text(
                    text = "30-45 min",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Orange
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = onBackHome,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Orange),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Back to Home", fontWeight = FontWeight.Bold)
        }
    }
}

private fun formatTime(seconds: Int): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}
