package com.tucker.merchant.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Tucker Brand Colors
val TuckerOrange = Color(0xFFD97706)
val TuckerDark = Color(0xFFB45309)
val TuckerLight = Color(0xFFFBBF24)
val TuckerCream = Color(0xFFFEF3C7)

private val LightColorScheme = lightColorScheme(
    primary = TuckerOrange,
    onPrimary = Color.White,
    primaryContainer = TuckerCream,
    onPrimaryContainer = TuckerDark,
    secondary = TuckerLight,
    onSecondary = TuckerDark,
    error = Color(0xFFDC2626),
    onError = Color.White,
    background = Color(0xFFFFFBEB),
    onBackground = Color(0xFF44403C),
    surface = Color.White,
    onSurface = Color(0xFF44403C)
)

private val DarkColorScheme = darkColorScheme(
    primary = TuckerOrange,
    onPrimary = Color.White,
    primaryContainer = TuckerDark,
    onPrimaryContainer = Color.White,
    secondary = TuckerLight,
    onSecondary = TuckerDark,
    error = Color(0xFFEF5350),
    onError = Color.White,
    background = Color(0xFF1C1917),
    onBackground = Color.White,
    surface = Color(0xFF292524),
    onSurface = Color.White
)

@Composable
fun TuckerMerchantTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
