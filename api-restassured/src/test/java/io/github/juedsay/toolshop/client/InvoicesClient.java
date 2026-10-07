package io.github.juedsay.toolshop.client;

import io.github.juedsay.toolshop.model.InvoiceRequest;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

/** {@code /invoices}: checkout and order history, requires authentication. */
public class InvoicesClient extends ApiClient {

    public InvoicesClient(RequestSpecification spec) {
        super(spec);
    }

    public Response create(InvoiceRequest invoice) {
        return request().body(invoice).post("/invoices");
    }

    public Response get(String invoiceId) {
        return request().get("/invoices/{id}", invoiceId);
    }
}
