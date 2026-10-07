package io.github.juedsay.toolshop.tests;

import static org.hamcrest.Matchers.equalTo;

import io.github.juedsay.toolshop.client.UsersClient;
import io.github.juedsay.toolshop.model.Address;
import io.github.juedsay.toolshop.model.Customer;
import io.github.juedsay.toolshop.support.AuthenticatedCustomer;
import io.github.juedsay.toolshop.support.TestSetup;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserProfileTest {

    private AuthenticatedCustomer session;
    private UsersClient users;

    @BeforeEach
    void newCustomer() {
        session = TestSetup.newAuthenticatedCustomer();
        users = new UsersClient(session.spec());
    }

    @Test
    void put_replaces_the_whole_profile() {
        Customer updated = session.customer()
                .withLastName("Updated")
                .withAddress(new Address("Second Street", "7", "Chicago", "Illinois", "US", "60601"))
                .withoutPassword();

        users.replace(session.id(), updated)
                .then().statusCode(200).body("success", equalTo(true));

        users.me()
                .then()
                .statusCode(200)
                .body("last_name", equalTo("Updated"))
                .body("address.street", equalTo("Second Street"))
                .body("address.city", equalTo("Chicago"));
    }

    @Test
    void patch_changes_only_the_given_fields() {
        users.patch(session.id(), Map.of("phone", "5559999999"))
                .then().statusCode(200).body("success", equalTo(true));

        users.me()
                .then()
                .statusCode(200)
                .body("phone", equalTo("5559999999"))
                .body("last_name", equalTo(session.customer().lastName()))
                .body("address.street", equalTo(session.customer().address().street()));
    }

    @Test
    void customer_cannot_modify_another_customer() {
        AuthenticatedCustomer other = TestSetup.newAuthenticatedCustomer();

        users.patch(other.id(), Map.of("first_name", "Hijacked"))
                .then()
                .statusCode(403)
                .body("error", equalTo("You can only update your own data."));

        new UsersClient(other.spec()).me()
                .then().body("first_name", equalTo(other.customer().firstName()));
    }

    @Test
    void customer_cannot_list_all_users() {
        users.list()
                .then().statusCode(403);
    }

    @Test
    void customer_cannot_delete_users() {
        users.delete(session.id())
                .then().statusCode(403);
    }
}
