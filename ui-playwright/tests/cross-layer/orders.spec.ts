import { expect, test } from '../../src/fixtures';

// Cross-layer tests: each one acts on one layer and verifies the outcome on the other,
// proving that the UI and the API agree about the same order.
test.describe('Orders across UI and API', () => {
  test('an order placed in the UI is recorded by the API', async ({
    loggedInCustomer: customer,
    catalogApi,
    checkoutApi,
    homePage,
    productPage,
    header,
    cartPage,
    checkoutPage,
  }) => {
    const product = await catalogApi.productByName('Combination Pliers');

    // UI: buy one unit.
    await homePage.goto();
    await homePage.openProduct(product.name);
    await productPage.addToCart();
    await expect(header.cartQuantity).toHaveText('1');
    await header.openCart();
    await cartPage.proceedButton.click();
    await checkoutPage.completeAsSignedInCustomer('cash-on-delivery');
    await expect(checkoutPage.orderConfirmation).toContainText('Thanks for your order!');
    const invoiceNumber = await checkoutPage.invoiceNumber();

    // API: the same invoice exists for this customer, with the right line and total.
    const invoice = await checkoutApi.invoiceByNumber(customer.token, invoiceNumber);
    expect(invoice.invoicelines).toHaveLength(1);
    expect(invoice.invoicelines?.[0]).toMatchObject({ quantity: 1, product: { name: product.name } });
    expect(invoice.total).toBeCloseTo(product.price, 2);
  });

  test('an order placed through the API shows up in My invoices', async ({
    loggedInCustomer: customer,
    catalogApi,
    checkoutApi,
    invoicesPage,
  }) => {
    // API: create the order.
    const product = await catalogApi.productByName('Slip Joint Pliers');
    const cartId = await checkoutApi.createCart();
    await checkoutApi.addToCart(cartId, product.id, 3);
    const billing = await checkoutApi.billingAddress('US', '62701', '42');
    const invoice = await checkoutApi.createInvoice(customer.token, cartId, billing);

    // UI: the customer sees it in their order history with the same total.
    await invoicesPage.goto();
    const row = invoicesPage.rowFor(invoice.invoice_number);
    await expect(row).toBeVisible();
    await expect(row).toContainText(billing.street);
    await expect(row).toContainText(`$${(product.price * 3).toFixed(2)}`);
  });
});
