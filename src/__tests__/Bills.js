/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import {bills} from "../fixtures/bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

//getBills containers/Bills.js
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //to-do write expect expression
      //Ajout de l'expect
      expect(windowIcon.className).toBe("active-icon");
    });

    //Ajout de la méthode sort dans la fichier views/BillsUI.js
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

//buttonNewBill/handleClickNewBill //containers/Bills.js
describe("When i click on New Bill", () => {
  test("Then the new bill page should open", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({pathname});
    };
    const mockedBills = new Bills({document, onNavigate, mockStore, localStorage: window.localStorage});

    const handleClickNewBill = jest.fn((e) => mockedBills.handleClickNewBill(e));

    const buttonNewBill = screen.getByTestId("btn-new-bill");
    buttonNewBill.addEventListener("click", handleClickNewBill);
    userEvent.click(buttonNewBill);

    expect(handleClickNewBill).toHaveBeenCalled();
    expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});
