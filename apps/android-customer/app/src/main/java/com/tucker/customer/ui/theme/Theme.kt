package com.tucker.customer.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Orange,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = OrangeLight,
    onPrimaryContainer = DarkGray,
    secondary = OrangeDark,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    background = androidx.compose.ui.graphics.Color.White,
    onBackground = DarkGray,
    surface = androidx.compose.ui.graphics.Color.White,
    onSurface = DarkGray,
    error = Red,
    onError = androidx.compose.ui.graphics.Color.White
)

private val DarkColorScheme = darkColorScheme(
    primary = Orange,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = OrangeDark,
    onPrimaryContainer = androidx.compose.ui.graphics.Color.White,
    secondary = OrangeLight,
    onSecondary = DarkGray,
    background = DarkGray,
    onBackground = androidx.compose.ui.graphics.Color.White,
    surface = DarkGray,
    onSurface = androidx.compose.ui.graphics.Color.White,
    error = Red,
    onError = androidx.compose.ui.graphics.Color.White
)

@Composable
fun TuckerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
