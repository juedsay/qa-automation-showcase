package io.github.juedsay.toolshop.client;

import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

/** {@code /products} and {@code /categories}: the read-only catalog. */
public class ProductsClient extends ApiClient {

    public ProductsClient(RequestSpecification spec) {
        super(spec);
    }

    public Response page(int page) {
        return request().queryParam("page", page).get("/products");
    }

    public Response byId(String productId) {
        return request().get("/products/{id}", productId);
    }

    public Response search(String query) {
        return request().queryParam("q", query).get("/products/search");
    }

    public Response byCategory(String categoryId) {
        return request().queryParam("by_category", categoryId).get("/products");
    }

    public Response categoryTree() {
        return request().get("/categories/tree");
    }
}
