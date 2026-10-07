package io.github.juedsay.toolshop.client;

import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

/**
 * {@code /postcode-lookup}: resolves country + postcode to a locality. The invoice endpoint
 * validates billing city/state against this lookup, so checkout data must come from it.
 */
public class PostcodeClient extends ApiClient {

    public PostcodeClient(RequestSpecification spec) {
        super(spec);
    }

    public Response lookup(String country, String postcode, String houseNumber) {
        return request()
                .queryParam("country", country)
                .queryParam("postcode", postcode)
                .queryParam("house_number", houseNumber)
                .get("/postcode-lookup");
    }
}
