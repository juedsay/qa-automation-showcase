package io.github.juedsay.toolshop.client;

import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

/**
 * Write endpoints of the catalog ({@code /brands}, {@code /categories}, {@code /products}).
 * Only used by the known-issue tests, always with an empty body so nothing is ever created
 * on the shared environment.
 */
public class CatalogAdminClient extends ApiClient {

    public CatalogAdminClient(RequestSpecification spec) {
        super(spec);
    }

    public Response create(String resource, Object body) {
        return request().body(body).post("/{resource}", resource);
    }
}
