package io.github.juedsay.toolshop.client;

import io.github.juedsay.toolshop.model.Credentials;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

/** {@code /users}: registration, login and profile management. */
public class UsersClient extends ApiClient {

    public UsersClient(RequestSpecification spec) {
        super(spec);
    }

    /** Accepts a {@code Customer} record or a raw map (for invalid payloads). */
    public Response register(Object customer) {
        return request().body(customer).post("/users/register");
    }

    public Response login(Credentials credentials) {
        return request().body(credentials).post("/users/login");
    }

    public Response me() {
        return request().get("/users/me");
    }

    public Response list() {
        return request().get("/users");
    }

    public Response replace(String userId, Object profile) {
        return request().body(profile).put("/users/{id}", userId);
    }

    public Response patch(String userId, Object fields) {
        return request().body(fields).patch("/users/{id}", userId);
    }

    public Response delete(String userId) {
        return request().delete("/users/{id}", userId);
    }
}
