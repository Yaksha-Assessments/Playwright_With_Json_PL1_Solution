import { expect, test, Page } from "playwright/test";
import AppointmentPage from "../../pages/AppointmentPage";
import UtilitiesPage from "../../pages/UtilitiesPage";
import DispensaryPage from "../../pages/DispensaryPage";
import { LoginPage } from "../../pages/LoginPage";
import ProcurementPage from "../../pages/ProcurementPage";
import PatientPage from "../../pages/PatientPage";
import ADTPage from "../../pages/ADTPage";
import RadiologyPage from "../../pages/RadiologyPage";
import LaboratoryPage from "../../pages/LaboratoryPage";
import path from "path";
import { CommonMethods } from "../commonMethods";

test.describe("Yaksha", () => {
  let appointmentPage: AppointmentPage;
  let utilitiesPage: UtilitiesPage;
  let dispensaryPage: DispensaryPage;
  let procurementPage: ProcurementPage;
  let loginPage: LoginPage;
  let patientPage: PatientPage;
  let adtPage: ADTPage;
  let radiologyPage: RadiologyPage;
  let laboratoryPage: LaboratoryPage;
  let context;
  let page: Page;

  test.beforeAll(async ({ browser: b }) => {
    context = await b.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    utilitiesPage = new UtilitiesPage(page);
    appointmentPage = new AppointmentPage(page);
    dispensaryPage = new DispensaryPage(page);
    procurementPage = new ProcurementPage(page);
    patientPage = new PatientPage(page);
    adtPage = new ADTPage(page);
    radiologyPage = new RadiologyPage(page);
    laboratoryPage = new LaboratoryPage(page);
    await page.goto("/");
  });

  let filePath = path.join(__dirname, "..", "..", "Data", "Result.xlsx");
  let jsonFilePath = path.join(__dirname, "..", "..", "Data", "testData.json");

  test.describe("boundary", () => {
    test("TS-1 Login with valid credentials from Excel", async () => {
      const loginData  = await CommonMethods.readJson(jsonFilePath, "ValidLogin")
      await loginPage.performLogin(loginData);
      
      // verifyUserIsLoggedin is for checking whether loging into functionality is implemented correctly or not
      await verifyUserIsLoggedin(page);
    });

    test("TS-2 Verify Page Navigation and Load Time for Billing Counter ", async () => {
      await utilitiesPage.verifyBillingCounterLoadState();

      // verifyUtilitiesURL is for checking whether page navigation is implemented correctly or not
      await verifyUtilitiesURL(page, "Utilities/ChangeBillingCounter");
    });

    test("TS-3 Patient Search with Valid Data ", async () => {
      await appointmentPage.navigateToAppointmentPage();
      const patientName = await appointmentPage.selectFirstPatient();
      await appointmentPage.searchPatient(patientName);
      await appointmentPage.verifypatientName(patientName);

      // verifyPatientSearchHappened is for checking whether patient search is implemented correctly or not
      await verifyPatientSearchHappened(page);
    });

    test("TS-4 Activate Counter in Dispensary", async () => {
      await dispensaryPage.verifyActiveCounterMessageInDispensary();

      // verifyDispensaryCounterActivation is for checking whether activation of counter in dispensary is implemented correctly or not
      await verifyDispensaryCounterActivation(page);
    });

    test("TS-5 Purchase Request List Load", async () => {
      await procurementPage.verifyPurchaseRequestListElements();

      // verifyUserIsOnCorrectURL is for checking whether purchase request load is implemented correctly or not
      await verifyUserIsOnCorrectURL(
        page,
        "ProcurementMain/PurchaseRequest/PurchaseRequestList"
      );
    });

    test("TS-6 Verify error message while adding new lab test in Laboratory", async () => {
      await laboratoryPage.verifyErrorMessage();

      // checkErrorMessageOccurs is for checking whether error message while adding lab test is implemented correctly or not
      await checkErrorMessageOccurs(page);
    });

    test("TS-7 Handle Alert on Radiology Module", async () => {
      const data = await CommonMethods.readJson(jsonFilePath, "DateRange");
      await radiologyPage.performRadiologyRequestAndHandleAlert(data)

      // verifyUserIsOnCorrectURL is for checking whether alert is handled on radiology module is implemented correctly or not
      await verifyUserIsOnCorrectURL(page, "Radiology/ImagingRequisitionList");
    });

    test("TS-8 Data-Driven Testing for Patient Search", async () => {
      const patientData = await CommonMethods.readJson(jsonFilePath, "PatientNames");
      await patientPage.searchAndVerifyPatients(patientData)

      // verifyUserIsOnCorrectURL is for checking whether data driven testing for patient search is implemented correctly or not
      await verifyUserIsOnCorrectURL(page, "Patient/SearchPatient");
    });

    test("TS-9 Error Handling and Logging in Purchase Request List", async () => {
      await procurementPage.verifyNoticeMessageAfterEnteringIncorrectFilters();

      // verifyDateFilterErrorMessage is for checking whether error handling is done in purchase request list is implemented correctly or not
      await verifyDateFilterErrorMessage(page);
    });

    test("TS-10 Keyword-Driven Framework for Appointment Search", async ({ }) => {
      await appointmentPage.searchAndVerifyPatient();

      // verifyPatientSearchHappened is for checking whether keyword driven framework is implemented correctly or not
      await verifyPatientSearchHappened(page);
    });

    test("TS-11 Modular Script for Patient Search", async () => {
      await appointmentPage.searchPatientInAppointment();
      await verifyPatientSearchHappened(page);
      await patientPage.searchPatientInPatientPage();
      await verifyPatientSearchHappened(page);
      await adtPage.searchPatientInADT()

      // verifyPatientSearchHappened is for checking whether module script for patient search is implemented correctly or not
      await verifyPatientSearchHappened(page);
    });

    test("TS-12 Verify Assertion for Counter Activation", async () => {
      await dispensaryPage.verifyCounterisActivated();

      // verifyDispensaryCounterActivation is for checking whether assertion for counter activation is implemented correctly or not
      await verifyDispensaryCounterActivation(page);
    });

    test("TS-13 Verify Locator Strategy for Appointment Search ", async () => {
      await appointmentPage.searchAndVerifyPatientList();

      // verifyPatientSearchHappened is for checking whether locator strategy is implemented correctly or not
      await verifyPatientSearchHappened(page);
    });

    test("TS-14 Verify the tooltip text on hover of Star icon in Laboratory", async () => {
      await laboratoryPage.verifyStarTooltip();
      const hoverUsed = await isHoverUsed(laboratoryPage.verifyStarTooltip);
      expect(hoverUsed).toBeTruthy();
    });

    test("TS-15 Navigation Exception Handling on Dispensary Page ", async () => {
      await dispensaryPage.navigateToDispensary();

      // verifyDispensaryPageURL is for checking whether exception handling on dispensary page is implemented correctly or not
      await verifyDispensaryPageURL(page, "/Dispensary/ActivateCounter");
    });

    test("TS-16 Web Element Handling for Dropdowns in Purchase Request", async () => {
      const data = await CommonMethods.readJson(jsonFilePath, "DateRange");
      await procurementPage.verifyRequestedDateColumnDateWithinRange(data);

      // verifyPurchaseReqDataIsPresent is for checking whether handling dropdowns in purchase request is implemented correctly or not
      await verifyPurchaseReqDataIsPresent(page);
    });

    test("TS-17 Login with invalid credentials", async () => {
      const loginData = await CommonMethods.readJson(jsonFilePath, "InvalidLogin");
      await loginPage.performLoginWithInvalidCredentials(loginData);

      // verifyUserIsNotLoggedin is for checking whether loging with invalid credentials is implemented correctly or not
      await verifyUserIsNotLoggedin(page);
    });
  });
});


// --------------------------------------------------------------------------------------------------------------------------

async function verifyUserIsLoggedin(page: Page) {
  // Verify successful login by checking if 'admin' element is visible
  await page
    .locator('//li[@class="dropdown dropdown-user"]')
    .waitFor({ state: "visible", timeout: 20000 });
  expect(
    await page.locator('//li[@class="dropdown dropdown-user"]').isVisible()
  );
}

async function verifyPatientSearchHappened(page: Page) {
  const patientList = await page.$$(
    `//div[@role='gridcell' and @col-id='ShortName']`
  );
  if (patientList.length == 1) {
    console.log("Patient search happened");
  } else {
    throw new Error("Patient search didn't happened");
  }
}

async function verifyDispensaryCounterActivation(page: Page) {
  expect(
    await page
      .locator("//button[contains(text(),'Deactivate Counter')]")
      .isVisible()
  ).toBeTruthy();
}

// async function verifyPurchaseRequestListURL(page: Page, expectedURL: string) {
async function verifyUserIsOnCorrectURL(page: Page, expectedURL: string) {
  const getActualURl = page.url();
  expect(getActualURl).toContain(expectedURL);
}

async function verifyDispensaryPageURL(page: Page, expectedURL: string) {
  const getActualURl = page.url();
  expect(getActualURl).toContain(expectedURL);
}

async function verifyUtilitiesURL(page: Page, expectedURL: string) {
  const utilitiesModule = page.locator("//span[text()='Utilities']");
  const ChangeBillingCounter = page.locator('//a[text()= " Change Billing Counter "]');

  // Navigate to Utilities Module
  await CommonMethods.highlightElement(utilitiesModule);
  await utilitiesModule.click();

  // Click on Change Billing Counter and measure load time
  await CommonMethods.highlightElement(ChangeBillingCounter);
  await ChangeBillingCounter.click();
  const getActualURl = page.url();
  expect(getActualURl).toContain(expectedURL);
}

async function verifyPurchaseReqDataIsPresent(page: Page) {
  const tableData = await page.$$(
    `div[ref="eCenterContainer"] div[col-id="RequestDate"]`
  );
  expect(tableData.length).toBeGreaterThanOrEqual(1);
}

async function verifyUserIsNotLoggedin(page: Page) {
  expect(
    await page
      .locator('//div[contains(text(),"Invalid credentials !")]')
      .isVisible()
  ).toBeTruthy();
}

async function checkErrorMessageOccurs(page: Page) {
  // Close the modal
  const closeButton = page.locator('//button[contains(text(),"Close")]');
  await CommonMethods.highlightElement(closeButton);
  await closeButton.click();

  expect(page.url()).toContain("Lab/Settings/LabTest");
}

async function isHoverUsed(method: Function): Promise<boolean> {
  const methodString = method.toString(); // Convert method to a string
  return methodString.includes(".hover"); // Check for 'hover' keyword
}

async function verifyDateFilterErrorMessage(page: Page) {
  const invalidMsg = page.locator(`//div[contains(@class,"invalid-msg-cal")]`);
  const errorMessage = await invalidMsg.textContent();
  expect(await invalidMsg.isVisible()).toBeTruthy();
  expect(errorMessage?.trim()).toEqual("Date is not between Range. Please enter again");
}
