package io.github.juedsay.toolshop.client;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import io.github.juedsay.toolshop.config.ApiConfig;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.config.LogConfig;
import io.restassured.config.ObjectMapperConfig;
import io.restassured.config.RestAssuredConfig;
import io.restassured.filter.log.LogDetail;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;

/**
 * Builds the request specifications shared by every client: base URI, JSON in/out,
 * snake_case mapping for the Java records, and request/response logging only when an
 * assertion fails (with the Authorization header masked, so tokens never reach CI logs).
 */
public final class RequestSpecs {

    /** Maps camelCase record components to the API's snake_case fields and back. */
    public static final ObjectMapper MAPPER = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .setSerializationInclusion(JsonInclude.Include.NON_NULL)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private static final RestAssuredConfig CONFIG = RestAssuredConfig.config()
            .objectMapperConfig(ObjectMapperConfig.objectMapperConfig()
                    .jackson2ObjectMapperFactory((type, charset) -> MAPPER))
            .logConfig(LogConfig.logConfig()
                    .enableLoggingOfRequestAndResponseIfValidationFails(LogDetail.ALL)
                    .blacklistHeader("Authorization"));

    private RequestSpecs() {
    }

    public static RequestSpecification anonymous() {
        return new RequestSpecBuilder()
                .setBaseUri(ApiConfig.apiUrl())
                .setContentType(ContentType.JSON)
                .setAccept(ContentType.JSON)
                .setConfig(CONFIG)
                .build();
    }

    public static RequestSpecification authenticated(String token) {
        return new RequestSpecBuilder()
                .addRequestSpecification(anonymous())
                .addHeader("Authorization", "Bearer " + token)
                .build();
    }
}
