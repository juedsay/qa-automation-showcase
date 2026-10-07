package io.github.juedsay.toolshop.support;

import io.github.juedsay.toolshop.client.PostcodeClient;
import io.github.juedsay.toolshop.client.ProductsClient;
import io.github.juedsay.toolshop.client.RequestSpecs;
import io.github.juedsay.toolshop.client.UsersClient;
import io.github.juedsay.toolshop.data.CustomerFactory;
import io.github.juedsay.toolshop.model.Address;
import io.github.juedsay.toolshop.model.Credentials;
import io.github.juedsay.toolshop.model.Customer;
import io.restassured.path.json.JsonPath;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Arrange-step helpers. Each one fails fast with a clear status check, so a broken setup is
 * reported as such instead of surfacing later as a confusing assertion in the test itself.
 */
public final class TestSetup {

    private static final UsersClient USERS = new UsersClient(RequestSpecs.anonymous());
    private static final ProductsClient PRODUCTS = new ProductsClient(RequestSpecs.anonymous());
    private static final PostcodeClient POSTCODES = new PostcodeClient(RequestSpecs.anonymous());

    private TestSetup() {
    }

    public static String register(Customer customer) {
        return USERS.register(customer).then().statusCode(201).extract().path("id");
    }

    public static AuthenticatedCustomer newAuthenticatedCustomer() {
        Customer customer = CustomerFactory.newCustomer();
        String id = register(customer);
        String token = USERS.login(new Credentials(customer.email(), customer.password()))
                .then().statusCode(200)
                .extract().path("access_token");
        return new AuthenticatedCustomer(id, customer, token);
    }

    /** Product ids are regenerated whenever the shared environment is reseeded, so look them up by name. */
    public static String productId(String exactName) {
        List<Map<String, Object>> products = PRODUCTS.search(exactName)
                .then().statusCode(200)
                .extract().jsonPath().getList("data");
        return idOfNamed(products.stream(), exactName);
    }

    public static String subcategoryId(String exactName) {
        List<List<Map<String, Object>>> subcategories = PRODUCTS.categoryTree()
                .then().statusCode(200)
                .extract().jsonPath().getList("sub_categories");
        return idOfNamed(subcategories.stream().flatMap(List::stream), exactName);
    }

    private static String idOfNamed(Stream<Map<String, Object>> items, String exactName) {
        return items
                .filter(item -> exactName.equals(item.get("name")))
                .map(item -> (String) item.get("id"))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Not found in catalog: " + exactName));
    }

    /** A billing address the invoice endpoint accepts: city and state must match the postcode lookup. */
    public static Address billingAddress(String country, String postcode, String houseNumber) {
        JsonPath body = POSTCODES.lookup(country, postcode, houseNumber).then().statusCode(200).extract().jsonPath();
        return new Address(
                body.getString("street"),
                houseNumber,
                body.getString("city"),
                body.getString("state"),
                country,
                postcode);
    }
}
