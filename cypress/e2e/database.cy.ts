describe("Database page test", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/database");
  });

  it("should display the database page", () => {
    cy.contains("Integrasi Data Onlimo");
    cy.url().should("include", "/database");
  });

  it("should display table", () => {
    cy.get("[data-testid='data-table']").should("exist");
  });

  it("should limit data table to 5", () => {
    cy.get("[data-testid='data-table']").should("have.length", 10);
    cy.get("[data-testid='limit-per-page']").click();
    cy.get("[data-testid='limit-5']").click();
    cy.get("[data-testid='data-table']").should("have.length", 5);
  });

  it("should filter data by station name", () => {
    cy.get("[data-testid='station-filter']").click();
    cy.get("[data-testid='station-filter-MUSIRAWAS-2']").should("exist");
    cy.get("[data-testid='station-filter-MUSIRAWAS-2']").click();
    cy.get("[data-testid='data-table']").should("contain.text", "MUSIRAWAS-2");
  });

  it("should reset filter", () => {
    cy.get("[data-testid='station-filter']").click();
    cy.get("[data-testid='station-filter-MUSIRAWAS-2']").click();
    cy.get("[data-testid='station-filter']").should("contain", "MUSIRAWAS-2");
    cy.get("[data-testid='limit-per-page']").click();
    cy.get("[data-testid='limit-5']").click();
    cy.get("[data-testid='limit-per-page']").should("contain", "5");

    cy.get("[data-testid='reset-filter']").click();
    cy.get("[data-testid='limit-per-page']").should("contain", "10");
    cy.get("[data-testid='station-filter']").should("contain", "Semua Stasiun");
  });

  it.only("should export an excel file", () => {
    cy.get("[data-testid='export-excel']").click();
    cy.get("[data-testid='loading-icon']").should("exist");
    cy.contains("Data Berhasil Diexport");
  });
});
