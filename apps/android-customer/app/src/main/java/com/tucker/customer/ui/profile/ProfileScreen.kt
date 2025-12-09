package com.tucker.customer.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.tucker.customer.ui.theme.Gray
import com.tucker.customer.ui.theme.Orange

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onLoginClick: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val isAuthenticated by viewModel.isAuthenticated.collectAsState()
    val user by viewModel.user.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Orange,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        if (!isAuthenticated) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(80.dp),
                        tint = Gray
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Please login to view profile", color = Gray)
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
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                // User info
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            AsyncImage(
                                model = user?.avatar,
                                contentDescription = "Avatar",
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(
                                    text = user?.nickname ?: "User",
                                    style = MaterialTheme.typography.titleMedium
                                )
                                Text(
                                    text = user?.phone ?: "",
                                    color = Gray,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }
                    }
                }

                // Menu items
                item {
                    ProfileMenuItem(
                        icon = Icons.Default.LocationOn,
                        title = "My Addresses",
                        onClick = { }
                    )
                }
                item {
                    ProfileMenuItem(
                        icon = Icons.Default.Favorite,
                        title = "Favorites",
                        onClick = { }
                    )
                }
                item {
                    ProfileMenuItem(
                        icon = Icons.Default.ConfirmationNumber,
                        title = "My Coupons",
                        onClick = { }
                    )
                }
                item {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                }
                item {
                    ProfileMenuItem(
                        icon = Icons.Default.Settings,
                        title = "Settings",
                        onClick = { }
                    )
                }
                item {
                    ProfileMenuItem(
                        icon = Icons.Default.Help,
                        title = "Help & Support",
                        onClick = { }
                    )
                }
                item {
                    ProfileMenuItem(
                        icon = Icons.Default.Info,
                        title = "About",
                        onClick = { }
                    )
                }
                item {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                }
                item {
                    TextButton(
                        onClick = { viewModel.logout() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        colors = ButtonDefaults.textButtonColors(contentColor = Color.Red)
                    ) {
                        Icon(Icons.Default.Logout, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Logout")
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileMenuItem(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit
) {
    ListItem(
        headlineContent = { Text(title) },
        leadingContent = {
            Icon(icon, contentDescription = null, tint = Gray)
        },
        trailingContent = {
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Gray)
        },
        modifier = Modifier.clickable(onClick = onClick)
    )
}

@Composable
private fun Modifier.clickable(onClick: () -> Unit): Modifier {
    return this.then(
        Modifier
    )
}
