package io.github.juedsay.toolshop.data;

import io.github.juedsay.toolshop.model.Address;
import io.github.juedsay.toolshop.model.Customer;
import java.util.UUID;

/**
 * Builds unique customers. Every test that changes state or logs in uses its own customer:
 * the environment is shared, and Toolshop locks an account after 3 failed logins.
 */
public final class CustomerFactory {

    private CustomerFactory() {
    }

    public static Customer newCustomer() {
        String id = shortId();
        return new Customer(
                "Quinn",
                "Tester" + id,
                "qa.showcase." + id + "@example.com",
                // Unique because the API rejects breached passwords; under 40 chars because
                // the UI login form caps passwords at 40 (registration has no maximum).
                "Qa!" + UUID.randomUUID().toString().substring(0, 12) + "Aa1",
                "1990-05-15",
                "5551234567",
                new Address("Main Street", "42", "Springfield", "Illinois", "US", "62701"));
    }

    public static String shortId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
