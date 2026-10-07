package io.github.juedsay.toolshop.tests;

import static io.github.juedsay.toolshop.support.Schemas.matchesSchema;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasKey;

import com.fasterxml.jackson.core.type.TypeReference;
import io.github.juedsay.toolshop.client.RequestSpecs;
import io.github.juedsay.toolshop.client.UsersClient;
import io.github.juedsay.toolshop.data.CustomerFactory;
import io.github.juedsay.toolshop.model.Credentials;
import io.github.juedsay.toolshop.model.Customer;
import io.github.juedsay.toolshop.support.AuthenticatedCustomer;
import io.github.juedsay.toolshop.support.TestSetup;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class AuthTest {

    private final UsersClient anonymous = new UsersClient(RequestSpecs.anonymous());

    @Test
    void login_with_valid_credentials_returns_a_bearer_token() {
        Customer customer = CustomerFactory.newCustomer();
        TestSetup.register(customer);

        anonymous.login(new Credentials(customer.email(), customer.password()))
                .then()
                .statusCode(200)
                .body(matchesSchema("token"))
                .body("token_type", equalTo("bearer"));
    }

    @Test
    void login_with_wrong_password_is_rejected() {
        // Own customer on purpose: failed logins against shared demo accounts lock them for everyone.
        Customer customer = CustomerFactory.newCustomer();
        TestSetup.register(customer);

        anonymous.login(new Credentials(customer.email(), "not-the-right-password"))
                .then()
                .statusCode(401)
                .body("error", equalTo("Unauthorized"));
    }

    @Test
    void profile_requires_a_token() {
        anonymous.me()
                .then()
                .statusCode(401);
    }

    @Test
    void profile_returns_the_authenticated_customer_without_the_password() {
        AuthenticatedCustomer session = TestSetup.newAuthenticatedCustomer();

        new UsersClient(session.spec()).me()
                .then()
                .statusCode(200)
                .body(matchesSchema("user"))
                .body("id", equalTo(session.id()))
                .body("email", equalTo(session.customer().email()))
                .body("address.city", equalTo(session.customer().address().city()));
    }

    @Test
    void registration_with_an_email_already_in_use_is_rejected() {
        Customer existing = CustomerFactory.newCustomer();
        TestSetup.register(existing);

        anonymous.register(CustomerFactory.newCustomer().withEmail(existing.email()))
                .then()
                .statusCode(409)
                .body("email[0]", equalTo("A customer with this email address already exists."));
    }

    @ParameterizedTest(name = "missing {0}")
    @ValueSource(strings = {"first_name", "last_name", "email", "password"})
    void registration_requires_mandatory_fields(String field) {
        Map<String, Object> payload = RequestSpecs.MAPPER.convertValue(
                CustomerFactory.newCustomer(), new TypeReference<>() {});
        payload.remove(field);

        anonymous.register(payload)
                .then()
                .statusCode(422)
                .body("$", hasKey(field));
    }
}
