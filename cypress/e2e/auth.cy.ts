describe("Authentication test", () => {
  beforeEach(() => {
    cy.visit("/login");

    // clear all cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage("auth-storage");

    // make sure the cookies and local storage is empty
    cy.getCookies().should("be.empty");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("auth-storage")).to.be.null;
    });
  });

  it("Should visit login", () => {
    cy.contains("Selamat datang di Fastpec").should("exist");
    cy.url().should("include", "/login");
  });

  it("should redirect to login page when not authenticated", () => {
    cy.clearCookies();
    cy.clearLocalStorage("auth-storage");
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("should redirect to dashboard if authenticated", () => {
    cy.login();
    cy.visit("/login");
    cy.url().should("include", "/dashboard");
  });

  it("Should failed login", () => {
    cy.get("input[name=username]").type("admin");
    cy.get("input[name=password]").type("admin");

    cy.get("button[type=submit]").click();
    cy.contains("Password invalid!").should("exist");
  });

  it("Should success login and logout", () => {
    cy.get("input[name=username]").type("admin");
    cy.get("input[name=password]").type("1234");
    cy.get("button[type=submit]").click();

    // check if the login is success
    cy.contains("Login Berhasil").should("exist");
    cy.url().should("include", "/dashboard");

    // Make sure the token is exist
    cy.getCookie("token").should("exist");
    cy.window().then((win) => {
      const authStorage = win.localStorage.getItem("auth-storage");
      expect(authStorage).to.not.be.null;
      const authState = authStorage ? JSON.parse(authStorage).state : null;
      expect(authState.user.success).to.be.true;
    });

    // Logout
    cy.get("[aria-label='logout-trigger']").click();
    cy.contains("Apakah anda yakin ingin logout?").should("exist");
    cy.get("[aria-label='logout-action']").click();
    cy.url().should("include", "/login");
  });
});
