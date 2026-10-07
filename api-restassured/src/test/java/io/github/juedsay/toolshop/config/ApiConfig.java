package io.github.juedsay.toolshop.config;

/**
 * Target environment. Defaults to the public Toolshop (sprint 5) API; override with the
 * {@code toolshop.apiUrl} system property or the {@code TOOLSHOP_API_URL} env var
 * (e.g. to run against a local Docker instance).
 */
public final class ApiConfig {

    private static final String DEFAULT_API_URL = "https://api.practicesoftwaretesting.com";

    private ApiConfig() {
    }

    public static String apiUrl() {
        String fromProperty = System.getProperty("toolshop.apiUrl");
        if (fromProperty != null && !fromProperty.isBlank()) {
            return fromProperty;
        }
        String fromEnv = System.getenv("TOOLSHOP_API_URL");
        return fromEnv != null && !fromEnv.isBlank() ? fromEnv : DEFAULT_API_URL;
    }
}
