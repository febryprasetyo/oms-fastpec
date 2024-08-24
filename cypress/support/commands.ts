declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
  }
}

// -- This is a parent command --
Cypress.Commands.add("login", () => {
  cy.session(
    "login",
    () => {
      cy.visit("/login");

      // Clear all cookies and local storage
      cy.clearCookies();
      cy.clearLocalStorage("auth-storage");

      // Make sure the cookies and local storage are empty
      cy.getCookies().should("be.empty");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("auth-storage")).to.be.null;
      });

      // Perform login
      cy.get("input[name=username]").type("admin");
      cy.get("input[name=password]").type("1234");
      cy.get("button[type=submit]").click();

      // Check if the login is successful
      cy.contains("Login Berhasil").should("exist");
      cy.url().should("include", "/dashboard");
    },
    {
      validate: () => {
        // Make sure the token is exist
        cy.getCookie("token").should("exist");
        cy.window().then((win) => {
          const authStorage = win.localStorage.getItem("auth-storage");
          expect(authStorage).to.not.be.null;
          const authState = authStorage ? JSON.parse(authStorage).state : null;
          expect(authState.user.success).to.be.true;
        });
      },
    },
  );
});
