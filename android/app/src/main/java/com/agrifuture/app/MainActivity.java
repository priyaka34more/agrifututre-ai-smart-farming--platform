package com.agrifuture.app;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Disable text selection
        getWindow().getDecorView().setLongClickable(false);
        // Configure WebView for native feel
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            WebSettings webSettings = webView.getSettings();
            // Disable zoom
            webSettings.setBuiltInZoomControls(false);
            webSettings.setDisplayZoomControls(false);
            webSettings.setSupportZoom(false);
            // Disable overscroll glow
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            // Improve performance
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
            webSettings.setDomStorageEnabled(true);
            webSettings.setJavaScriptEnabled(true);
        }
    }
}
