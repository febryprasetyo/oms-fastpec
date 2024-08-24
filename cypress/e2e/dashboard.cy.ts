describe("Dashboard Test", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/dashboard");
  });

  it("should redirect to login page when token is expired", () => {
    cy.clearCookies();
    cy.clearLocalStorage("auth-storage");
    cy.visit("/dashboard", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem(
          "auth-storage",
          JSON.stringify({
            state: {
              user: {
                success: true,
                data: {
                  username: "admin",
                  role: "admin",
                },
              },
              token: "expired-token",
            },
          }),
        );
      },
    });
    cy.url().should("include", "/login");
  });

  it("should redirect to dashboard page after login success", () => {
    cy.url().should("include", "/dashboard");
    cy.contains("List Stasiun");
  });

  it("should show station list", () => {
    cy.get("[data-testid=station-card]").should("have.length.greaterThan", 0);
  });

  it("should navigate to monitoring page when station card clicked", () => {
    cy.contains("BANGLI-1").click();
    cy.url().should("include", "/monitoring/240305005225028");
    cy.contains("BANGLI-1");
  });
});
