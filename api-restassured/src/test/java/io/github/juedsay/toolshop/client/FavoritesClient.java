package io.github.juedsay.toolshop.client;

import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.Map;

/** {@code /favorites}: per-customer, requires authentication. */
public class FavoritesClient extends ApiClient {

    public FavoritesClient(RequestSpecification spec) {
        super(spec);
    }

    public Response add(String productId) {
        return request().body(Map.of("product_id", productId)).post("/favorites");
    }

    public Response list() {
        return request().get("/favorites");
    }

    public Response get(String favoriteId) {
        return request().get("/favorites/{id}", favoriteId);
    }

    public Response delete(String favoriteId) {
        return request().delete("/favorites/{id}", favoriteId);
    }
}
